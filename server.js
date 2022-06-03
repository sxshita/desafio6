const express = require('express');
const { engine } = require("express-handlebars");
const app = express();
const fs = require('fs');
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');

app.engine(
  'hbs',
  engine({
      extname: '.hbs',
      defaultLayout: 'index.hbs',
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set('views','./public/views');
app.set('view engine','hbs');


// ** [CONTENEDORES] **//

// -- Contenedor Productos -- //

class ProductsContainer {
  constructor(){
      this.products = [
          { title: 'Calculadora', price: 2300, thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-128.png', id: 1 },
          { title: 'Lapiz', price: 200, thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/pencil-pen-stationery-school-128.png', id: 2 }
      ];
      this.counter = 3;
  };

 addProduct = (product) => {
      const id = this.counter;
      const productToPush = product;
      productToPush.id = id;
      this.products.push(productToPush);
      this.counter++;
      return id;
 };

 getProducts = () => {
     return this.products;
 };
};

// -- Contenedor Mensajes -- //
class MessagesContainer {
  constructor(name){
    this.name = `${name}.txt`;
  };

  async save(message){
    try {
      const messagesArray = await this.getAll();
      messagesArray.push(message);

      await fs.promises.writeFile(this.name, JSON.stringify(messagesArray));
    } 
    catch(err) {
      console.log('Error al escribir el archivo: ', err);
    };
  };

  async getAll(){
    try{
      await fileExist(this.name);

      let data = await fs.promises.readFile(this.name);
      data = JSON.parse(data);
      return data;
    }
    catch(err) {
      console.log('Error al obtener todos los productos: ', err);
      return [];
    };
      
  };
}

// -- Helpers -- //

const fileExist = async (path) => {
  try {
    const stats = fs.existsSync(path);

    if (stats == false) {
      await fs.promises.writeFile(path, "[]");
    };
  }
  catch(err) {
    console.log(err);
  };
};

const productsCont = new ProductsContainer();
const msgCont = new MessagesContainer('messages');

// ** [FIN CONTENEDORES] **//

app.get('/', (req, res) => {
  const products = productsCont.getProducts();
  res.render('table', { products });
});

// ** [WEBSOCKETS] ** //
const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

socketServer.on('connection', async (socket) => {
  socket.emit('products', productsCont.getProducts());
  socket.emit('messages', await msgCont.getAll());

  socket.on('new_product', (product) => {
    productsCont.addProduct(product);
    let products = productsCont.getProducts();
    socketServer.sockets.emit('products', products);
  });

  socket.on('new_message', async (message) => {
    try{
      await msgCont.save(message);
      let messages = await msgCont.getAll();
      socketServer.sockets.emit('messages', messages);
    }
    catch(err){
      console.log(`error: ${err}`);
    }
  });

});

httpServer.listen(8080, () => {
  console.log('Servidor corriendo en puerto 8080');
})
