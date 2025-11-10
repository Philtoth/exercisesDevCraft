
const request = require("supertest");
const app = require("./server.js");

describe("📚 Book API", () => {

  // ────────────────────────────────────────────────
  // SUCCESSFUL TESTS
  // ────────────────────────────────────────────────
  describe("Successful Requests", () => {

    it("should return all books (GET /books → 200)", async () => {
      const res = await request(app).get("/books");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should add a new book (POST /book → 200)", async () => {
      const payload = { title: "Fahrenheit 451", author: "Ray Bradbury" };
      const res = await request(app)
        .post("/book")
        .send(payload)
        .set("Content-Type", "application/json");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("Id");
      expect(res.body.title).toBe(payload.title);
      expect(res.body.author).toBe(payload.author);
    });

    it("should get a specific book by ID (GET /book/:Id → 200)", async () => {
      // Create one first
      const create = await request(app)
        .post("/book")
        .send({ title: "Dune", author: "Frank Herbert" })
        .set("Content-Type", "application/json");
      const id = create.body.Id;

      const res = await request(app).get(`/book/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("title", "Dune");
    });

    it("should delete an existing book (DELETE /book/:Id → 200)", async () => {
      // Create one to delete
      const create = await request(app)
        .post("/book")
        .send({ title: "DeleteMe", author: "Test" })
        .set("Content-Type", "application/json");
      const id = create.body.Id;

      const res = await request(app).delete(`/book/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.text).toMatch(/successful/i);
    });
  });

  // ────────────────────────────────────────────────
  // UNSUCCESSFUL TESTS
  // ────────────────────────────────────────────────
  describe("Unsuccessful Requests", () => {

    it("should return 400 when title missing (POST /book → 400)", async () => {
      const res = await request(app)
        .post("/book")
        .send({ author: "Author Only" })
        .set("Content-Type", "application/json");
      expect(res.statusCode).toBe(400);
      expect(res.text).toMatch(/Title/i);
    });

    it("should return 400 when author missing (POST /book → 400)", async () => {
      const res = await request(app)
        .post("/book")
        .send({ title: "No Author" })
        .set("Content-Type", "application/json");
      expect(res.statusCode).toBe(400);
      expect(res.text).toMatch(/Author/i);
    });

    it("should return 404 for non-existent book (GET /book/:Id → 404)", async () => {
      const res = await request(app).get("/book/99999");
      expect(res.statusCode).toBe(404);
    });

    it("should return 404 when deleting non-existent book (DELETE /book/:Id → 404)", async () => {
      const res = await request(app).delete("/book/99999");
      expect(res.statusCode).toBe(404);
    });

  });
});