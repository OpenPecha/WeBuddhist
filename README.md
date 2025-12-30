# WeBuddhist Study Platform

This is the frontend codebase for the Webuddhist study platform.

## Prerequisites

- Node.js (v20 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/OpenPecha/WeBuddhist.git
   ```

2. Navigate to Webuddhist directory:

   ```bash
   cd Webuddhist
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

## Development

1. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:5173](http://localhost:5173)

2. Run the test cases:
   ```bash
   npm run test
   ```
3. Run the test coverage:
   ```bash
   npm run coverage
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run format` - Run prettier formatting
- `npm run test` - Run tests
- `npm run coverage` - Generate test coverage report

## Key Features

- Internationalization support via tolgee
- Authentication via Auth0
- Component based Approach vis Shadcn
- State management with React Query

## Tech Stack

- React 18
- React Router DOM
- Shadcn
- Auth0
- tolgee
- React Query
- Vite
- Vitest

## Docker Support

Build and run using Docker:

```bash
# Build the Docker image
docker build -t app-pecha-frontend .

# Run the container
docker run -p 80:80 app-pecha-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
