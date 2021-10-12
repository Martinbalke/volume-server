import express from 'express';

const app = express();

app.get('/', (_,res) => {
  res.send('hello')
})


app.listen(8080, () => console.log('App live on 8080'))