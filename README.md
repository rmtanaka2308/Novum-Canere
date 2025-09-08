# Novo Canere

A web application for karaoke lovers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later)
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/novo-canere.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Configuration

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to your project's settings and copy the `Project URL` and `anon` key.
3.  Create a `.env.local` file in the root of the project and add the following lines:

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
    ```

4.  In your Supabase project, create a new table called `songs` with the following columns:
    -   `id` (uuid)
    -   `title` (text)
    -   `artist` (text)
    -   `lrc` (text)
    -   `user_id` (uuid)

### Running the application

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Built With

*   [Next.js](https://nextjs.org/) - The React Framework for Production
*   [Supabase](https://supabase.io/) - The open source Firebase alternative
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
*   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript at Any Scale.