 MERN Stack Snake Game
 Welcome page
 
![6084A211-25E1-4BAF-AB89-F07AE653AD1B](https://github.com/user-attachments/assets/a8d4a60d-850d-477a-860b-bd05bb0af91b)

Game Video
https://github.com/RanbirProjects/Snake-game-by-Ranbir/issues/1#issue-3105819358

A modern implementation of the classic Snake game using the MERN stack (MongoDB, Express.js, React.js, Node.js).

 Features

- Classic Snake gameplay
- Score tracking
- High score leaderboard
- Modern UI with styled-components
- Responsive design

Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/snake-game
   PORT=5000
   ```

 Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

 How to Play

- Use arrow keys to control the snake
- Eat the red food to grow and increase your score
- Avoid hitting the walls or yourself
- Try to achieve the highest score possible!

Technologies Used

- Frontend:
  - React.js
  - Styled-components
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose

## License

MIT # Snake-game-by-Ranbir
