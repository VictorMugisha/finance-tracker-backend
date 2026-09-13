import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Tracker API',
      version: '1.0.0',
      description:
        'API for tracking group contributions and finances for a small group.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development',
      },
    ],
    tags: [{ name: 'Health', description: 'Operational health checks' }],
  },
  apis: ['./src/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
