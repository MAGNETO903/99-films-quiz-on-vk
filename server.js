
// алхимический квест
/*

https://yandex.ru/games/play/199672/?draft=true&game_url=https://localhost:8443
https://yandex.ru/games/play/199672/?draft=true&game_url=https://079a-188-32-16-198.ngrok.io
https://079a-188-32-16-198.ngrok.io
https://alchemy-quest.onrender.com/
*/

// загрузка тех. модулей
const express = require('express'); //фреймворк
const app = express()
var fs = require('fs');
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};
const router = express.Router();
const http = require('http')
const https = require('https')
const { Client } = require('pg')
var bodyParser = require('body-parser');
const { Server } = require("socket.io");
const { randomUUID } = require('crypto'); 

//const server = require('https').createServer(options, app); //сервер
const port = process.env.PORT || 3000; //активный порт


const cur_dir = '/public'

var streamer_id = -1;
var streamer_data;

//const connect_str = "postgres://uptnwmzzkwicwg:7acceb845514472f0c2363e5550b1d933974cb879dd7d7e63eb7a432353ca011@ec2-63-34-223-144.eu-west-1.compute.amazonaws.com:5432/daee65gi6qvsos"

// postgres://alchemy_quest_db_user:rSEaYKdO0mXZk4wYPWnBQ8upmtPDLdx9@dpg-cdcvtnaen0htugj0bpd0-a.frankfurt-postgres.render.com/alchemy_quest_db

/*

dpg-cdcvtnaen0htugj0bpd0-a.frankfurt-postgres.render.com

alchemy_quest_db_user
rSEaYKdO0mXZk4wYPWnBQ8upmtPDLdx9


*/

const connect_str = 'postgresql://postgres:AIMFQWnGdsg9LlHA@db.mpvmdgybecrqprjzvpne.supabase.co:5432/postgres'

// подключаемся к БД
const client = new Client({
  connectionString: connect_str,
  ssl: { rejectUnauthorized: false }
});

client.connect();

/*
var command = `CREATE TABLE system_logs (
  id serial PRIMARY KEY,
  data json
);`
client.query(command, (err, res) => {
  if (err) {
    console.log(err);
  } else for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
})

*/

// подготовка
app.use(express.static(__dirname + cur_dir, {
   //etag: true,
    //maxAge: '25920000000'
}));


app.use(bodyParser.json()) // note: this is before the route
app.use((req, res, next) => {
  //res.set('Cache-control', 'public, max-age=25920000000')
   next();
});

const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

app.post('/report', (req, res) => {
  console.log(req.body)

  var report = JSON.stringify(req.body);

  var command = `INSERT INTO reports (report) \n Values('${report}');`
  
  client.query(command, (err, res) => {
    if (err) {
      console.log(err);
    } else for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
  })

  if (!req.body) return res.sendStatus(400)

  res.set("Access-Control-Allow-Origin", "*");
	res.set("Access-Control-Allow-Credentials", "true");
	res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  
  data = {
    "name": "Tony Stark",
  }
  res.send(JSON.stringify(data))
})

app.post('/promocode', (req, res) => {

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                        
    var command = `SELECT * FROM players WHERE player_id = '` + req.body.player_id + `'`
    console.log(command)
    client.query(command, (err1, res1) => {
        if (err1) {
            console.log(err1); 
            data = {
                "msg": "error",
            }
            res.send(JSON.stringify(data))
        } else {
            if (res1.rowCount > 0) {
            // теперь ищем этот промокод
                var command2 = `SELECT * FROM promocodes WHERE code = '` + req.body.promocode + `'`
                client.query(command2, (err2, res2) => {
                    if (err2) {
                        console.log(err2);
                        
                        data = {
                            "msg": "error",
                        }
                        res.send(JSON.stringify(data))
                    } else {
                        if (res2.rowCount > 0) {
                            //console.log(res2);
                            // успешный сценарий
                            var uses_limit_reached = false; // кол-во использований
                            var date_limit_reached = false; // дата использования
                            var already_used = false; // уже использовался (для случая если он одноразовый)

                            // если есть лимит на кол-во использований
                            if (res2.rows[0].limited) {
                                //console.log(res2.rows[0].times_used + 1,  res2.rows[0].times_used_limit);
                                if (Number(res2.rows[0].times_used) + 1 > Number(res2.rows[0].times_used_limit)) {
                                    uses_limit_reached = true;
                                }
                            }

                            if (res2.rows[0].have_expiration_date) {
                                var date_1 = new Date();
                                var date_2 = new Date(res2.rows[0].expiration_date);

                                if (date_1 > date_2) {
                                    date_limit_reached = true;
                                }
                            }

                            if (res2.rows[0].disposable) {
                                if (res1.rows[0].used_promos == null) {
                                    res1.rows[0].used_promos = [];
                                }
                                console.log(res1.rows[0].used_promos);
                                if (res1.rows[0].used_promos.includes(res2.rows[0].code)) {
                                    already_used = true;
                                }
                            }


                            console.log(date_limit_reached);

                            if (uses_limit_reached == false && date_limit_reached == false && already_used == false) {
                                data = {
                                    "msg": res2.rows[0].bonus_type,
                                }
                               
                                res.send(JSON.stringify(data))

                                // обновляем счётчик использований

                                if (res2.rows[0].limited) {
                                    
                                    var command3 = `UPDATE promocodes SET times_used = `+ (Number(res2.rows[0].times_used) + 1) +` WHERE id = `+ res2.rows[0].id +`;`
                                    console.log(command3);
                                    client.query(command3, (err3, res3) => {
                                        if (err3) {
                                            console.log(err3);
                                        }
                                    })
                                }

                                if (res2.rows[0].disposable) {
                                    var command4 = `UPDATE players SET used_promos = array_append(used_promos, '`+ res2.rows[0].code +`') WHERE id = `+ res1.rows[0].id +`;`
                                    console.log(command4);
                                    client.query(command4, (err4, res4) => {
                                        if (err4) {
                                            console.log(err4);
                                        }
                                    })
                                }

                            } else {
                                data = {
                                    "msg": "error",
                                }
                                if (already_used) {
                                    data.msg = "already_used"
                                }
                                res.send(JSON.stringify(data))
                            }

                        } else {
                            // нет такого промокода
                            data = {
                                "msg": "error",
                            }
                            res.send(JSON.stringify(data))
                        }
                    }
                })
            } else {
                data = {
                    "msg": "error",
                }
                res.send(JSON.stringify(data))
            }
        }
    })
})

app.post('/hello', (req, response) => {
  // игрок только вошёл
  console.log(req.body)
  if (!req.body) return response.sendStatus(400)

  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Credentials", "true");
  response.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  response.set("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  
  if (req.body.player_id == 0) {
    // новый игрок, генерируем ID и высылаем
    var new_player_id = randomUUID();
    req.body.player_id = new_player_id;

    // добавляем в БД
    var command = `INSERT INTO players (player_id) \n Values('${new_player_id}');`
  
    client.query(command, (err, res) => {
      if (err) {
        console.log(err);
      } else { 
        for (let row of res.rows) {
          console.log(JSON.stringify(row));
        }
        data = {
          "msg": "hello!",
          "player_id": new_player_id
        }
        response.send(JSON.stringify(data))
      }
    })
  } else {
    // ищем в БД такой id
    var command = `SELECT * FROM players WHERE player_id = '` + req.body.player_id + `'`
    console.log(command)
    client.query(command, (err, res) => {
      if (err) {
        console.log(err);
        // создаем новый ID
          var new_player_id = randomUUID();
          req.body.player_id = new_player_id;

          // добавляем в БД
          var command = `INSERT INTO players (player_id) \n Values('${new_player_id}');`
        
          client.query(command, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              for (let row of res.rows) {
                console.log(JSON.stringify(row));
              }
              data = {
                "msg": "hello!",
                "player_id": new_player_id
              }
              response.send(JSON.stringify(data))
            }
          })
      } else {
        console.log(res.rowCount);
        for (let row of res.rows) {
          
          console.log(JSON.stringify(row));
        }
        if (res.rowCount == 0) {
          // создаем новый ID
          /*
          var new_player_id = randomUUID();
          req.body.player_id = new_player_id;

          // добавляем в БД
          var command = `INSERT INTO players (player_id) \n Values('${new_player_id}');`
        
          client.query(command, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              for (let row of res.rows) {
                console.log(JSON.stringify(row));
              }
              data = {
                "msg": "hello!",
                "player_id": new_player_id
              }
              response.send(JSON.stringify(data))
            }
          })
          */
          // ыыы игрок сломал себе игру
        } else {
          // всё хорошо
          data = {
            "msg": "hello!",
            "player_id": req.body.player_id
          }
          response.send(JSON.stringify(data))
        }
      }
    })
  }

  
})

app.use(express.json())
// запуск сервера

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

httpServer.listen(port);
httpsServer.listen(8443);

const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('i_am_streamer', function(data) {
    console.log('streamer_connected');
    console.log(data);
    console.log(socket.id);
    streamer_id = socket.id;
  })
  if (streamer_id != -1) {
    socket.emit('streamer_action', streamer_data);
  }
  socket.on('streamer_action', function(data) {
    socket.broadcast.emit('streamer_action', data);
    streamer_data = data;
  })

  socket.on('open_game_viewport', function(data) {
    socket.broadcast.emit('open_game_viewport');
  })

  socket.on('open_options', function(data) {
    socket.broadcast.emit('open_options');
  })

  socket.on('open_shop', function(data) {
    socket.broadcast.emit('open_shop');
  })

  socket.on('open_shop_popup', function(data) {
    socket.broadcast.emit('open_shop_popup');
  })

  socket.on('open_shop_popup2', function(data) {
    socket.broadcast.emit('open_shop_popup2');
  })

  socket.on('open_shop_popup3', function(data) {
    socket.broadcast.emit('open_shop_popup3');
  })

  socket.on('close_shop_popup', function(data) {
    socket.broadcast.emit('close_shop_popup');
  })

  socket.on('close_shop_popup2', function(data) {
    socket.broadcast.emit('close_shop_popup2');
  })

  socket.on('close_shop_popup3', function(data) {
    socket.broadcast.emit('close_shop_popup3');
  })

  socket.on('make_screenshot', function(data) {
    socket.broadcast.emit('make_screenshot');
  })
});

// уведомление о запуске
console.log(cur_dir)
console.log('The game avialable at: ');
console.log("http://localhost:"+port);
console.log("https://localhost:8443");
console.log("https://yandex.ru/games/play/199672/?draft=true&game_url=https://localhost:8443")


const ngrok = require('ngrok');
(async function() {
  await ngrok.authtoken('1kPiMow2GghbdPhIfPpbXv5DTB3_2sPuTLACk7X68oyGrNxua');
  const url = await ngrok.connect("https://localhost:8443");
  console.log(url)
  //console.log("https://yandex.ru/games/play/199672/?draft=true&game_url="+url)
})();