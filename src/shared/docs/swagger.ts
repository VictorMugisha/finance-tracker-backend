import swaggerJsdoc from "swagger-jsdoc"

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Tracker API",
      version: "1.0.0",
      description: "API for tracking group contributions and finances for a small group.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Health", description: "Operational health checks" },
      { name: "Auth", description: "Authentication" },
      { name: "Members", description: "Group participants" },
      { name: "Contributions", description: "Contribution rounds" },
      { name: "Assignments", description: "Per-member contribution requirements" },
      { name: "Payments", description: "Individual deposits" },
      { name: "Expenses", description: "Group spending" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Member: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            phone: { type: "string", nullable: true },
            role: {
              type: "string",
              enum: ["LEADER", "ASSISTANT", "ACCOUNTANT", "MEMBER"],
              nullable: true,
            },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            user: {
              type: "object",
              nullable: true,
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                phone: { type: "string" },
                isAdmin: { type: "boolean" },
                isActive: { type: "boolean" },
                memberId: { type: "string", nullable: true },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./src/**/*.ts"],
}

export const swaggerSpec = swaggerJsdoc(options)
