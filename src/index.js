const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(400).json({error: `usuario com o username ${username} nao foi encontrado`})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const {name, username} = request.body;

  if( !name || !username ){
    return response.status(400).json({error: `campos 'name' e 'username' sao obrigatorios.`})
  }

  const userExists = users.some(
    (user) => user.username === username
  );

  if(userExists){
      return response.status(400).json({
          error: `o username ${username} ja esta em uso.`
      })
  }

  users.push({ 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  });

  return response.status(201).json({message: `o username ${username} foi cadastrado no sistema!`})

});

app.get('/users', (request, response) => {
  // Complete aqui
  return response.json(users)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {user} = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const {user} = request;

  const {title, deadline} = request.body;

  user.todos.push({ 
    id: uuidv4(),
    title,
    done: false, 
    deadline, 
    created_at: new Date()
  })

  return response.status(201).json({
    message: "nova tarefa registrada",
    data: user.todos
  })

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const  { user } = request;

  const {title, deadline} = request.body;
  const { id } = request.params;

  if(!title && !deadline){
    return response.status(400).json({error: "nenhuma alteração realizada!"});
  }

  const todo = user.todos.find( todo => todo.id === id );

  if(!todo){
    return response.status(400).json({error: "tarefa nao encontrada no usuario informado!"});
  }

  todo.title = !title ? todo.title : title;
  todo.deadline = !deadline ? todo.deadline : deadline;

  return response.json({message: "tarefa editada com sucesso!"});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find( todo => todo.id === id );

  if(!todo){
    return response.status(400).json({error: "tarefa nao encontrada no usuario informado!"});
  }

  todo.done = true;

  return response.json({message: "tarefa concluída!"});

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui

  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find( todo => todo.id === id );

  if(!todo){
    return response.status(400).json({error: "tarefa nao encontrada no usuario informado!"});
  }

  user.todos.splice(todo, 1);

  return response.status(200).json(user.todos);

});

module.exports = app;