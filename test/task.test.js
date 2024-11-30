const request = require("supertest");
const app = require("../server");
const Task = require("../models/Task");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let token;

beforeEach(async () => {
  // Create a test user
  const user = await User.create({
    username: "testuser",
    email: "test@example.com",
    password: "password123",
  });

  // Generate a JWT token
  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
});

describe("Task Management", () => {
  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "A sample task description",
        deadline: "2024-12-01",
        priority: "medium",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("title", "Test Task");
  });

  it("should fetch all tasks", async () => {
    await Task.create({
      title: "Task 1",
      description: "Description 1",
      deadline: "2024-12-01",
      priority: "low",
      user: jwt.decode(token).id,
    });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("should update a task", async () => {
    const task = await Task.create({
      title: "Old Title",
      description: "Old description",
      deadline: "2024-12-01",
      priority: "low",
      user: jwt.decode(token).id,
    });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Title");
  });

  it("should delete a task", async () => {
    const task = await Task.create({
      title: "Task to delete",
      description: "Will be deleted",
      deadline: "2024-12-01",
      priority: "low",
      user: jwt.decode(token).id,
    });

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Task deleted successfully");
  });
});
