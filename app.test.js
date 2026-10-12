
const request = require('supertest')
const app = require('./app')
const users = require('./data/users')

// Restore the original data before every test
const initialUsers = [
    { id: 1, name: 'Ahmed', age: 20 },
    { id: 2, name: 'Sara', age: 25 },
    { id: 3, name: 'Yacine', age: 20 }
]

beforeEach(() => {
    users.splice(0, users.length, ...initialUsers.map(user => ({ ...user })))
})

// ==============================
// GET /
// ==============================

describe('GET /', () => {
    test('should return the welcome message', async () => {
        const response = await request(app).get('/')

        expect(response.status).toBe(200)
        expect(response.text).toBe('Hello from express')
    })
})

// ==============================
// GET /products
// ==============================

describe('GET /products', () => {
    test('should return the products message', async () => {
        const response = await request(app).get('/products')

        expect(response.status).toBe(200)
        expect(response.text).toBe('List of products')
    })
})

// ==============================
// GET /users
// ==============================

describe('GET /users', () => {
    test('should return all users', async () => {
        const response = await request(app).get('/users')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
        expect(response.body).toHaveLength(3)

        expect(response.body[0]).toEqual({
            id: 1,
            name: 'Ahmed',
            age: 20
        })
    })

    test('should return users with the requested age', async () => {
        const response = await request(app).get('/users?age=20')

        expect(response.status).toBe(200)
        expect(response.body.length).toBeGreaterThan(0)
        expect(response.body.every(user => user.age === 20)).toBe(true)
    })

    test.each([
        ['empty age', ''],
        ['non-numeric age', 'abc'],
        ['zero age', '0'],
        ['negative age', '-5'],
        ['decimal age', '20.5']
    ])('should reject %s', async (_description, age) => {
        const response = await request(app)
            .get(`/users?age=${age}`)

        expect(response.status).toBe(400)
        expect(response.text).toBe('Invalid user age')
    })
})

// ==============================
// GET /users/:id
// ==============================

describe('GET /users/:id', () => {
    test('should return a user when the ID exists', async () => {
        const response = await request(app).get('/users/1')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            id: 1,
            name: 'Ahmed',
            age: 20
        })
    })

    test.each(['abc', '0', '-1', '1.5'])(
        'should reject invalid ID %s',
        async id => {
            const response = await request(app).get(`/users/${id}`)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Id is invalid')
        }
    )

    test('should return 404 when the user does not exist', async () => {
        const response = await request(app).get('/users/999')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
    })
})

// ==============================
// POST /users
// ==============================

describe('POST /users', () => {
    test('should assign ID 1 when creating the first user', async () => {
    users.splice(0, users.length)

    const response = await request(app)
        .post('/users')
        .send({ name: 'First User', age: 22 })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
        id: 1,
        name: 'First User',
        age: 22
    })
})
    test('should create a user with valid data', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: '  Karim  ', age: 24 })

        expect(response.status).toBe(201)
        expect(response.body).toEqual({
            id: 4,
            name: 'Karim',
            age: 24
        })

        expect(users).toHaveLength(4)
    })

    test('should reject a missing name', async () => {
        const response = await request(app)
            .post('/users')
            .send({ age: 24 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Name must be a string'
        )
    })

    test('should reject a non-string name', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 123, age: 24 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Name must be a string'
        )
    })

    test('should reject an empty name', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: '   ', age: 24 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Name should not be empty'
        )
    })

    test.each(['24', 24.5, null])(
        'should reject invalid age: %s',
        async age => {
            const response = await request(app)
                .post('/users')
                .send({ name: 'Karim', age })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty(
                'message',
                'Age must be an integer'
            )
        }
    )

    test('should reject a missing age', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 'Karim' })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Age must be an integer'
        )
    })

    test('should reject zero age', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 'Karim', age: 0 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Age must be positive'
        )
    })

    test('should reject negative age', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 'Karim', age: -2 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Age must be positive'
        )
    })
})

// ==============================
// PUT /users/:id
// ==============================

describe('PUT /users/:id', () => {
    test('should update an existing user', async () => {
        const response = await request(app)
            .put('/users/1')
            .send({ name: '  Amine  ', age: 30 })

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            id: 1,
            name: 'Amine',
            age: 30
        })

        expect(users.find(user => user.id === 1).name).toBe('Amine')
    })

    test('should reject an invalid ID', async () => {
        const response = await request(app)
            .put('/users/abc')
            .send({ name: 'Amine', age: 30 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Id is invalid')
    })

    test('should return 404 for a missing user', async () => {
        const response = await request(app)
            .put('/users/999')
            .send({ name: 'Amine', age: 30 })

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
    })

    test('should reject an invalid update body', async () => {
        const response = await request(app)
            .put('/users/1')
            .send({ name: '   ', age: 30 })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty(
            'message',
            'Name should not be empty'
        )
    })
})

// ==============================
// DELETE /users/:id
// ==============================

describe('DELETE /users/:id', () => {
    test('should delete an existing user', async () => {
        const response = await request(app).delete('/users/2')

        expect(response.status).toBe(200)
        expect(response.text).toBe('User with id 2 deleted succesfully')
        expect(users.some(user => user.id === 2)).toBe(false)
        expect(users).toHaveLength(2)
    })

    test('should reject an invalid ID', async () => {
        const response = await request(app).delete('/users/abc')

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Id is invalid')
    })

    test('should return 404 for a missing user', async () => {
        const response = await request(app).delete('/users/999')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'User not found')
    })
})

// ==============================
// GET /admin
// ==============================

describe('GET /admin', () => {
    test('should reject requests without the access key', async () => {
        const response = await request(app).get('/admin')

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('message', 'Access denied')
    })

    test('should reject an incorrect access key', async () => {
        const response = await request(app)
            .get('/admin')
            .set('x-access-key', 'wrong-key')

        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('message', 'Access denied')
    })

    test('should allow requests with the correct access key', async () => {
        const response = await request(app)
            .get('/admin')
            .set('x-access-key', process.env.ADMIN_ACCESS_KEY)

        expect(response.status).toBe(200)
        expect(response.body).toEqual({
            message: 'Welcome to the admin area'
        })
    })
})

// ==============================
// Error handling
// ==============================

describe('Error handling', () => {
    test('should return 500 for an unexpected error', async () => {
        const response = await request(app).get('/test-error')

        expect(response.status).toBe(500)
        expect(response.body).toEqual({
            message: 'Internal server error'
        })
    })
})
