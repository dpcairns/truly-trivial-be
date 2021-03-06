require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const testQuestion = {
      category: 'Science: Computers',
      type: 'multiple',
      difficulty: 'easy',
      question: 'When Gmail first launched, how much storage did it provide for your email?',
      correct_answer: '1GB',
      incorrect_answers: ['512MB', '5GB', 'Unlimited'],
    };

    test('posts a new favorite', async(done) => {

      const expectation = {
        id: 3,
        category: 'Science: Computers',
        type: 'multiple',
        difficulty: 'easy',
        question: 'When Gmail first launched, how much storage did it provide for your email?',
        correct_answer: '1GB',
        incorrect_answers: '["512MB","5GB","Unlimited"]',
        user_id: 2,
      };

      const data = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(testQuestion)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      done();
    });

    test('returns a single favorite', async(done) => {

      const expectation = [{
        id: 3,
        category: 'Science: Computers',
        type: 'multiple',
        difficulty: 'easy',
        question: 'When Gmail first launched, how much storage did it provide for your email?',
        correct_answer: '1GB',
        incorrect_answers: '["512MB","5GB","Unlimited"]',
        user_id: 2,
      }];

      const data = await fakeRequest(app)
        .get('/api/favorites/3')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      done();
    });

    test('returns favorites', async(done) => {

      const expectation = [
        {
          id: 3,
          category: 'Science: Computers',
          type: 'multiple',
          difficulty: 'easy',
          question: 'When Gmail first launched, how much storage did it provide for your email?',
          correct_answer: '1GB',
          incorrect_answers: '["512MB","5GB","Unlimited"]',
          user_id: 2,
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      done();
    });

    test('deletes a single favorite', async(done) => {

      const expectation = [];

      await fakeRequest(app)
        .delete('/api/favorites/3')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/favorites/3')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      done();
    });

    test('returns any string', async(done) => {

      const data = await fakeRequest(app)
        .get('/api/questions?searchQuery=amount=1')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.results[0].question).toEqual(expect.any(String));

      done();
    });
  });
});
