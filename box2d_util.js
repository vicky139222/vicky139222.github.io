var box2d_time_step;
var box2d_vel_iterations;
var box2d_pos_iterations;

var box2d_world;
var pixels_per_meter = 100;

var box2d_module;

function to_meter(value) {
	return value / pixels_per_meter;
}

function to_pixel(value) {
	return value * pixels_per_meter;
}

function deg(rad) {
	return rad / Math.PI * 180;
}

function rad(deg) {
	return deg / 180 * Math.PI;
}

function create_box2d(Box2D, gravity_x, gravity_y, fps, position_iterations, velocity_iterations) {
	if (fps === undefined) fps = 60.0;
	if (position_iterations === undefined) position_iterations = 8;
	if (velocity_iterations === undefined) velocity_iterations = 3;
	box2d_module = Box2D;
	var gravity = new box2d_module.b2Vec2(to_meter(gravity_x), to_meter(gravity_y));
	box2d_world = new box2d_module.b2World(gravity);
	box2d_time_step = 1.0 / fps;
	box2d_pos_iterations = position_iterations;
	box2d_vel_iterations = velocity_iterations;
	// box2d_world.SetAllowSleeping(false);
}

function enable_box2d(sprite, x, y, width, height, dynamic, density, friction, bounce) {
	if (dynamic === undefined) dynamic = true;
	if (density === undefined) density = 1.0;
	if (friction === undefined) friction = 0.5;
	if (bounce === undefined) bounce = 0.25;
	var box2d_body = {
		body: null,
		
		get_x: function () {
			return to_pixel(box2d_body.body.GetPosition().get_x());
		},
		
		get_y: function () {
			return to_pixel(box2d_body.body.GetPosition().get_y());
		},
		
		set_x: function (value) {
			var position = box2d_body.body.GetPosition();
			position.set_x(to_meter(value));
			box2d_body.body.SetTransform(position, box2d_body.body.GetAngle());
			return value;
		},
		
		set_y: function (value) {
			var position = box2d_body.body.GetPosition();
			position.set_y(to_meter(value));
			box2d_body.body.SetTransform(position, box2d_body.body.GetAngle());
			return value;
		},
		
		get_velocity_x: function () {
			return to_pixel(box2d_body.body.GetLinearVelocity().get_x());
		},
		
		get_velocity_y: function () {
			return to_pixel(box2d_body.body.GetLinearVelocity().get_y());
		},
		
		set_velocity_x: function (value) {
			var velocity = box2d_body.body.GetLinearVelocity();
			velocity.set_x(to_meter(value));
			box2d_body.body.SetLinearVelocity(velocity);
			return value;
		},
		
		set_velocity_y: function (value) {
			var velocity = box2d_body.body.GetLinearVelocity();
			velocity.set_y(to_meter(value));
			box2d_body.body.SetLinearVelocity(velocity);
			return value;
		},
		
		set_collision: function (value) {
			box2d_body.body.GetFixtureList().SetSensor(!value);
			return value;
		},
		
		get_angle: function (value) {
			return deg(box2d_body.body.GetAngle());
		},
		
		set_angle: function (value) {
			box2d_body.body.SetTransform(box2d_body.body.GetPosition(), rad(value));
			return value;
		},
		
		update: function () {
			var position = box2d_body.body.GetPosition();
			var angle = box2d_body.body.GetAngle();
			sprite.x = to_pixel(position.get_x());
			sprite.y = to_pixel(position.get_y());
			sprite.angle = deg(angle);
		},
		
		destroy: function () {
			box2d_world.DestroyBody(box2d_body.body);
		},
	};
	
	sprite.anchor.set(0.5);
	sprite.width = width;
	sprite.height = height;
	
	var body_def = new box2d_module.b2BodyDef();
	if (dynamic) body_def.set_type(box2d_module.b2_dynamicBody);
	body_def.get_position().Set(to_meter(x), to_meter(y));
	box2d_body.body = box2d_world.CreateBody(body_def);
	
	var box = new box2d_module.b2PolygonShape();
	box.SetAsBox(to_meter(width / 2), to_meter(height / 2));
	
	var fixture_def = new box2d_module.b2FixtureDef();
	fixture_def.set_shape(box);
	fixture_def.set_density(density);
	fixture_def.set_friction(friction);
	fixture_def.set_restitution(bounce);
	
	box2d_body.body.CreateFixture(fixture_def);
	
	sprite.box2d_body = box2d_body;
	sprite.box2d_body.update();
	
	sprite.update = function () {
		sprite.box2d_body.update();
	}
}

function update_box2d() {
	box2d_world.Step(box2d_time_step, box2d_vel_iterations, box2d_pos_iterations);
}
	
