const Pool = require('pg').Pool
const bcrypt = require("bcrypt")
const {hash} = require("bcrypt");
const jwt = require('jsonwebtoken');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
})

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createUser = (request, response) => {
    const { name, email, password } = request.body
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, function(err, hash) {
            pool.query('INSERT INTO users (name, email, roles, password) VALUES ($1, $2, $3, $4)', [name, email, "players", hash], (error, results) => {
                if (error) {
                    throw error
                }
                response.status(201).send(`User added with ID: ${results.insertId}`)
        });
    })

    })
}

const login = (request, response) => {
    const { email, password } = request.body
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, result) => {
        if (error) {
            throw error
        }
        const hash = result.rows[0].password
        bcrypt.compare(password, hash, function(err, check) {
            if(check) {
                const role = result.rows[0].roles
                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                let data = {
                    time: Date(),
                    role: role,
                }
                const token = jwt.sign(data, jwtSecretKey);
                response.status(200).send(token)
            }else {
                response.status(200).send(`NTM`)
            }
        })
        })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}
function verifyJwt(token) {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, jwtSecretKey)
    return decoded.role
}
const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)
    try {
        const token = request.headers["authorization"].split(' ')[1];
        if(verifyJwt(token) === "admin"){
            pool.query('DELETE FROM users WHERE id = $1', [id], () => {
                response.status(200).send(`User deleted with ID: ${id}`)
            })
        }else{
            // Access Denied
            return response.status(401).send("non");
        }
    } catch (error) {
        // Access Denied
        return response.status(401).send(error);
    }
}

module.exports = {
    login,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}
