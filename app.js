require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//find the max number of the id
app.post('/player/:name', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading data file');
            return;
        }

        let players;
        players = JSON.parse(data);

        let maxId = 0;
        for (const player of players) {
            if (player.id > maxId) {
                maxId = player.id;
            }
        }

        const newPlayer = {
            id: maxId + 1,
            name: req.params.name
        };

        players.push(newPlayer);

        fs.writeFile('data.json', JSON.stringify(players, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing data file');
            } else {
                res.status(201).send(newPlayer);
            }
        });
    });
});
app.get('/user', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
            res.status(404).send(err);
        } else {
            res.status(200).send(JSON.parse(data));
        }
    }
    )})


app.post('/player', (req, res) => {
  res.send(req.body);
})


app.put('/player/:id', (req, res) => {
     fs.readFile('data.json', 'utf8', (err, data) => {
         if(err) {
             res.status(500).send('Error reading data file');
             return;
         }
         else {
                let players;
                players = JSON.parse(data);
                let player = players.find(p => p.id === parseInt(req.params.id));
                if(player) {
                    player.name = req.body.name;
                    fs.writeFile('data.json', JSON.stringify(players, null, 2), (err) => {
                        if(err) {
                            res.status(500).send('Error writing data file');
                        }
                        else {
                            res.status(200).send(player);
                        }
                    });
                }
                else {
                    res.status(404).send('Player not found');
         }

     }
}
)})

// delete
app.delete('/player/:id', (req, res) => {
    fs.readFile('data.json', 'utf8', (err, data) => {
        if(err) {
            res.status(500).send('Error reading data file');
            return;
        }
        else {
            let players;
            players = JSON.parse(data);
            let player = players.find(p => p.id === parseInt(req.params.id));
            if(player) {
                players = players.filter(p => p.id !== parseInt(req.params.id));
                fs.writeFile('data.json', JSON.stringify(players, null, 2), (err) => {
                    if(err) {
                        res.status(500).send('Error writing data file');
                    }
                    else {
                        res.status(200).send(player);
                    }
                });
            }
            else {
                res.status(404).send('Player not found');
            }
        }
    })})
    ;

  app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
