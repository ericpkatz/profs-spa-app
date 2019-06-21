const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_db');


const SEED = `
  DROP TABLE IF EXISTS users;
  CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE
  ); 
  INSERT INTO users(name) values('moe');
  INSERT INTO users(name) values('larry');
`;

const syncAndSeed = async ()=> {
  try{
    await client.connect();
    await client.query(SEED);
  }
  catch(ex){
    console.log(ex);
  }
};

syncAndSeed();



const express = require('express');
const app = express();

app.use(express.urlencoded());

const port = process.env.PORT || 3000;

app.post('/', async(req, res, next)=> {
  try{
    await client.query('INSERT into users(name) values($1)', [req.body.name]);
    res.redirect('/');
  }
  catch(ex){
    next(ex);
  }
});

app.get('/', async(req, res, next)=> {
  try {
    const response = await client.query('SELECT * from users'); 
    const users = response.rows;
    res.send(`
      <html>
        <head></head>
        <body>
          <h1><a href='/'>Profs Web App</a></h1>
          <ul>
          ${ 
            users.map( user => `<li>${ user.name }</li>`).join('')
          }
          </ul>
          <form method='POST'>
            <input name='name' />
            <button>Create User</button>
          </form>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.listen(port, ()=> console.log(`listening on port ${port }`));
