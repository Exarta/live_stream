export function FpsPlaycanvas(pc) {
  const CharacterController = pc.createScript("characterController");

  CharacterController.attributes.add("camera", {
    type: "entity",
    title: "Camera Entity",
  });

  CharacterController.attributes.add("speed", {
    type: "number",
    default: 8,
    title: "Movement Speed",
  });

  CharacterController.attributes.add("fastSpeed", {
    type: "number",
    default: 20,
    title: "Fast Movement Speed",
  });

  CharacterController.attributes.add("sensitivity", {
    type: "number",
    default: 0.3,
    title: "Look Sensitivity",
  });

  CharacterController.attributes.add("lookSpeed", {
    type: "number",
    default: 0.2,
    title: "Drag Look Speed",
  });

  CharacterController.prototype.initialize = function () {
    console.log(this.app);
    this.pitch = new pc.Quat();
    this.yaw = new pc.Quat();
    this.velocity = new pc.Vec3();
    this.look = new pc.Vec2(0, 0);
    this.targetVelocity = new pc.Vec3();

    // Drag camera states
    this.isMouseDown = false;
    this.lastX = 0;
    this.lastY = 0;
    this.eulers = new pc.Vec3();

    // Mode tracking
    this.isDragMode = false;

    // Store camera reference
    this.cameraEntity = this.camera || this.entity.findByName("camera");

    // Get initial rotation
    var angles = this.entity.getLocalEulerAngles();
    this.eulers.x = angles.x;
    this.eulers.y = angles.y;

    // Bind methods
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    // Add event listeners
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseleave", this.onMouseLeave);
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);

    if (!this.entity.rigidbody) {
      console.warn("CharacterController needs a rigidbody component");
      return;
    }

    const rigidbody = this.entity.rigidbody;
    rigidbody.linearDamping = 0.9;
    rigidbody.angularDamping = 0.9;
    rigidbody.linearFactor = new pc.Vec3(1, 1, 1);
    rigidbody.angularFactor = new pc.Vec3(0, 0, 0);
  };

  // CharacterController.prototype.onMouseDown = function (event) {
  //   if (event.button === pc.MOUSEBUTTON_LEFT) {
  //     this.isDragMode = true;
  //     this.isMouseDown = true;
  //     this.lastX = event.x;
  //     this.lastY = event.y;
  //     document.body.style.cursor = "grab";
  //   }
  // };

  CharacterController.prototype.onMouseLeave = function () {
    // Instead of stopping drag, we'll keep tracking if mouse button is still down
    if (this.isMouseDown) {
      this.isDragMode = false;
    }
    document.body.style.cursor = "grab";
  };

  CharacterController.prototype.onMouseMove = function (e) {
    // Only allow mouse dragging if we are not actively moving the character with the keyboard
    if (this.isMouseDown) {
      const dx = e.x - this.lastX; // Mouse movement in the X-direction (horizontal)
      const dy = e.y - this.lastY; // Mouse movement in the Y-direction (vertical)

      this.lastX = e.x;
      this.lastY = e.y;

      // Update both x (pitch) and y (yaw) euler angles based on mouse movement
      this.eulers.x -= dy * this.lookSpeed * 0.5; // Vertical rotation
      this.eulers.y -= dx * this.lookSpeed * 0.5; // Horizontal rotation

      // Clamp vertical rotation (pitch) to prevent flipping the camera upside down
      this.eulers.x = pc.math.clamp(this.eulers.x, 0, 89);
      // this.eulers.y = pc.math.clamp(this.eulers.y, -89, 89);

      // Create quaternions for pitch and yaw rotation
      this.pitch.setFromEulerAngles(this.eulers.x, this.eulers.y, 0); // Vertical rotation (pitch)
      // this.yaw.setFromEulerAngles(this.eulers.x, this.eulers.y, 0); // Horizontal rotation (yaw)

      // Apply yaw (horizontal rotation) to the character (entity)
      // this.entity.setRotation(this.yaw);

      // Apply pitch (vertical rotation) to the camera
      if (this.cameraEntity) {
        this.cameraEntity.setLocalRotation(this.pitch);
      }
    }
  };

  CharacterController.prototype.update = function (dt) {
    if (!this.entity.rigidbody) return;

    const rigidbody = this.entity.rigidbody;
    const cameraForward = this.cameraEntity.forward.clone();
    const cameraRight = this.cameraEntity.right.clone();

    // Make sure to ignore the vertical component of camera movement (no y-axis)
    cameraForward.y = 0;
    cameraRight.y = 0;

    cameraForward.normalize();
    cameraRight.normalize();

    const movement = new pc.Vec3();
    const speed = this.app.keyboard.isPressed(pc.KEY_SHIFT)
      ? this.fastSpeed
      : this.speed;

    // Keyboard-based movement (WASD or arrow keys)
    if (
      this.app.keyboard.isPressed(pc.KEY_W) ||
      this.app.keyboard.isPressed(pc.KEY_UP)
    ) {
      movement.add(cameraForward);
    }
    if (
      this.app.keyboard.isPressed(pc.KEY_S) ||
      this.app.keyboard.isPressed(pc.KEY_DOWN)
    ) {
      movement.sub(cameraForward);
    }
    if (
      this.app.keyboard.isPressed(pc.KEY_A) ||
      this.app.keyboard.isPressed(pc.KEY_LEFT)
    ) {
      movement.sub(cameraRight);
    }
    if (
      this.app.keyboard.isPressed(pc.KEY_D) ||
      this.app.keyboard.isPressed(pc.KEY_RIGHT)
    ) {
      movement.add(cameraRight);
    }

    if (!movement.equals(pc.Vec3.ZERO)) {
      movement.normalize().scale(speed);
    }

    const currentVelocity = rigidbody.linearVelocity;
    const lerpFactor = Math.min(dt * 12, 1);

    // Update target velocity (only x and z components for horizontal movement)
    this.targetVelocity.x = movement.x;
    this.targetVelocity.z = movement.z;
    this.targetVelocity.y = currentVelocity.y;

    // Smoothly interpolate between current and target velocity for a smoother movement
    this.velocity.lerp(currentVelocity, this.targetVelocity, lerpFactor);

    if (this.app.keyboard.wasPressed(pc.KEY_SPACE)) {
      this.velocity.y = 20;
    }

    rigidbody.linearVelocity = this.velocity;
  };

  // Reset isMoving when mouse is released, to ensure it doesn't interfere with the drag mode
  CharacterController.prototype.onMouseUp = function (event) {
    // Check if the event is triggered on an overlay element
    if (event.element && event.element.classList.contains("overlay-element")) {
      return; // Ignore events on the overlay
    }
    if (event.button === pc.MOUSEBUTTON_LEFT) {
      this.isMouseDown = false;
      // this.isDragMode = false;
      document.body.style.cursor = "grab";
    }
  };

  // Ensure mouse dragging only occurs if the character isn't moving
  CharacterController.prototype.onMouseDown = function (event) {
    if (event.element && event.element.classList.contains("overlay-element")) {
      return; // Ignore events on the overlay
    }
    if (event.button === pc.MOUSEBUTTON_LEFT) {
      // if (!this.isMoving) {
      // this.isDragMode = true;
      this.isMouseDown = true;
      this.lastX = event.x;
      this.lastY = event.y;
      document.body.style.cursor = "grabbing";
      // }
    }
  };

  CharacterController.prototype.destroy = function () {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseleave", this.onMouseLeave);
    this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
  };
}
