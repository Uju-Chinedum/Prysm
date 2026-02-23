import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prysm | Backend Engineered Right</title>

    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Gabriola', serif;
        background: linear-gradient(135deg, #0f172a, #1e293b);
        color: #f8fafc;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      header {
        padding: 20px 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        font-size: 32px;
        letter-spacing: 2px;
      }

      nav a {
        color: #f8fafc;
        text-decoration: none;
        margin-left: 25px;
        font-size: 20px;
        transition: 0.3s ease;
      }

      nav a:hover {
        color: #38bdf8;
      }

      .hero {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 40px;
      }

      .hero h1 {
        font-size: 70px;
        margin-bottom: 20px;
      }

      .hero p {
        font-size: 28px;
        max-width: 700px;
        margin: 0 auto 30px;
        opacity: 0.85;
      }

      .cta {
        display: inline-block;
        padding: 12px 30px;
        font-size: 22px;
        border-radius: 6px;
        background-color: #38bdf8;
        color: #0f172a;
        text-decoration: none;
        transition: 0.3s ease;
      }

      .cta:hover {
        background-color: #0ea5e9;
      }

      .features {
        padding: 60px;
        background-color: #111827;
        text-align: center;
      }

      .features h2 {
        font-size: 48px;
        margin-bottom: 40px;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 40px;
      }

      .feature {
        background: #1f2937;
        padding: 30px;
        border-radius: 10px;
        font-size: 24px;
      }

      footer {
        text-align: center;
        padding: 20px;
        background: #0f172a;
        font-size: 18px;
        opacity: 0.7;
      }
    </style>
  </head>

  <body>

    <header>
      <div class="logo">Prysm</div>
      <nav>
        <a href="/">Home</a>
        <a href="https://github.com/Uju-Chinedum/Prysm" target="_blank" rel="noopener noreferrer">Docs</a>
        <a href="https://github.com/Uju-Chinedum/Prysm" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>

    <section class="hero">
      <div>
        <h1>Prysm</h1>
        <p>
          A structured, production-ready backend foundation built with NestJS,
          Prisma, PostgreSQL and JWT authentication.
        </p>
        <a href="/api/v1" class="cta">Get Started</a>
      </div>
    </section>

    <section class="features">
      <h2>Built With Intention</h2>
      <div class="feature-grid">
        <div class="feature">
          Modular Architecture<br/>
          Clean NestJS structure ready to scale.
        </div>
        <div class="feature">
          Prisma ORM<br/>
          Type-safe database access with migrations.
        </div>
        <div class="feature">
          JWT Authentication<br/>
          Secure auth foundation out of the box.
        </div>
      </div>
    </section>

    <footer>
      © ${new Date().getFullYear()} Prysm. Built with precision.
    </footer>

  </body>
  </html>
  `;
  }
}
