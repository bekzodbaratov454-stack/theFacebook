// qiladigan ishlarim 
1-- blogga create amalini qushaman
2-- blogga get va getAll amalini qushaman
3-- blogga delete id qushaman 
4-- blogga put amalini qushaman

-- Asosiy maqsadim validatsiya --
-- register va login qismini qushaman va bular username va password orqali ishlataman



http://localhost:4000/api/blog/signup

{
  "name": "Bekzod",
  "age": 17,
  "username": "bekzod123",
  "password": "mypassword",
  "isActive": true
}



login (signin) endpointini test qilish

POST http://localhost:4000/api/blog/signin

{
  "username": "bekzod123",
  "password": "mypassword"
}

Body → raw → JSON:



sign up -> http://localhost:4000/api/blog/signup




Signin (kirish):

Method: POST
URL: http://localhost:4000/api/blog/signin
Body → raw → JSON:

json{
  "username": "bekzod123",
  "password": "mypassword"
}








POST http://localhost:3000/api/blog/signup   → register
POST http://localhost:3000/api/blog/signin   → token olish
POST http://localhost:3000/api/posts         → post yaratish
GET  http://localhost:3000/api/posts         → barcha postlar
GET  http://localhost:3000/api/posts/:id     → bitta post
PUT  http://localhost:3000/api/posts/:id     → yangilash
DELETE http://localhost:3000/api/posts/:id   → o'chirish






POST   http://localhost:3000/api/posts/:id/comments  → comment yaratish
GET    http://localhost:3000/api/posts/:id/comments  → commentlarni ko'rish
DELETE http://localhost:3000/api/posts/comments/:id  → o'chirish





POST http://localhost:3000/api/blog/signup
Body (JSON):
{
    "name": "Ali",
    "age": 20,
    "username": "ali123",
    "password": "123456"
}



POST http://localhost:3000/api/blog/signin
Body (JSON):
{
    "username": "ali123",
    "password": "123456"
}
// Response da token keladi — uni ko'chir!








6. Post commentlarini olish:
GET http://localhost:3000/api/posts/64f3a2b1c9d.../comments
// token kerak emas




8. Commentni o'chirish — token kerak:
DELETE http://localhost:3000/api/posts/comments/64f3a2b1c9d...
Headers:
    Authorization: Bearer <token>





POST http://localhost:4000/api/blog/signin
Body:
{
    "username": "bekzod123",
    "password": "mypassword"
}




POST http://localhost:4000/api/blog/refresh
Body:
{
    "refreshToken": "...yuqoridagi refreshToken..."
}




user ruyxatdan utmagan bulsa ham kirish accses beriladi ammo like bosmoqchi yoki cament yozmoqchi bullsa ruyxatdan utishi kerak 


<!-- Loyihaga password-reset va email yuborishni qo'shish
Bunda postga kommentariya yozilganda post egasini ogohlantiruvchi email yuborish -->



// sign up


{
  "name": "John Doe",
  "age": 20,
  "username": "johndoe",
  "email": "john@gmail.com",
  "password": "secret123"
}


sign in 

{
  "username": "johndoe",
  "password": "secret123"
}



forget - pass 

3. Forgot Password — POST /api/blog/forgot-password
Body → raw → JSON:
json

{
  "email": "john@gmail.com"
}


This sends a reset link to the email. ⚠️ But as I mentioned earlier, your code also returns the signedUrl directly in the response — so you can copy it from there for testing.





reset 

4. Reset Password — POST /api/blog/reset-password?userId=PASTE_USER_ID_HERE
Body → raw → JSON:
json


{
  "password": "newpassword123"
}


Get the userId from the signup response (data.user._id).




// sending via email


--> POST 
-->  http://localhost:4000/api/blog/forgot-password

{
  "email": "bekzodbaratov454@gmail.com"
}








dssgkjaebf
TEST