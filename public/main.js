const socket = io();

const enviarProducto = (e) => {
    console.log('entre');
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const thumbnail = document.getElementById("thumbnail").value;
    const product = { title, price, thumbnail  };
    socket.emit('new_product', product);
    title = ' ';
    price = ' ';
    thumbnail = ' ';
    return false;
};

const crearEtiquetasProducto = (product) => {
    const { title, price, thumbnail } = product;
    return `
        <tr>
            <td>${title}</td>
            <td>${price}</td>
            <td><img style="width: 50px; height:50px" src=${thumbnail} alt=${title}></td>
        </tr>
    `
};

const agregarProductos = (productos) => {
    const finalProducts = productos.map(p => crearEtiquetasProducto(p)).join(" ");
    document.getElementById('productsTable').innerHTML = finalProducts;
};

socket.on('products', (products) => agregarProductos(products));

//-------------------------------------------------------------------

const enviarMensaje = (e) => {
    const author = document.getElementById('author').value;
    const text = document.getElementById('text').value;
    const date = String(new Date().toDateString() + ' ' + new Date().toLocaleTimeString())
    const message = { author, text, date };
    socket.emit('new_message', message);
    author = ' ';
    text = ' ';
    return false;
}

const crearEtiquetasMensaje = (message) => {
    const { author, text, date } = message;
    return `
    <div>
        <strong style='color:blue'>${author}</strong>
        <p style='color:brown'>${date}</p>
        <i style='color:green'>${text}</i>
    </div>
    `;
}

const agregarMensajes = (messages) => {
    if (messages !== null) {
        const finalMessages = messages.map(m => crearEtiquetasMensaje(m)).join(' ');
        document.getElementById('messages').innerHTML = finalMessages;
    }
}

socket.on('messages', (messages) => agregarMensajes(messages));