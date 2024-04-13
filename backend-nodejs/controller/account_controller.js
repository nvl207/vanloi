var database = require("../config/db_connect");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Email = require("./email_controller");
const uuid = require('uuid');


// hàm login bị lỗi

// đang ở đây : done
module.exports.getAccount = (req, res) => {
  try {
    const {token} = req.body;
    if(token==null){
        return res.status(422).json({
            msg: "Vui lòng cung cấp token",
        });
    }
    const theToken = token;
    jwt.verify(theToken, process.env.SECRECT,(err,decoded)=>{
        if(err){
            return res.json({msg:err})
        }else{
            const sql = 'SELECT id_account,username,name,email,avartar,id_role,status FROM account WHERE id_account = ? ';
            database.query(sql,[decoded.id],(err,rows,fields)=>{
                if (err) {
                    return res.json({msg:err});
                }else{
                    return res.json(rows);
                }
            })
        }
    });
  
} catch (error) {
    return res.status(500).json({ msg: error.message });
}

} // ok



// 

module.exports.getAccountById = (req,res)=>{
  try {
      const {id_account} = req.body;

    
      const sql = 'SELECT id_account,name FROM account WHERE id_account = ? ';
      database.query(sql, [id], (err, rows, fields) => {
          if (err) {
              return res.json({ msg: err });
          } else {
              return res.json(rows);
          }
      })
          
      
    
  } catch (error) {
      return res.status(500).json({ msg: error.message });
  }
 
} // ok



module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body; // truyền username, password vào body PM
    const sql_query = "SELECT * FROM account WHERE username = ?";

    database.query(sql_query, [username], async (err, rows, fields) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      if (rows.length === 0) {
        return res.status(422).json({ msg: "Tài khoản không hợp lệ" });
      } else {
        // So sánh mật khẩu đã hash trong cơ sở dữ liệu với mật khẩu cung cấp từ yêu cầu
        const passMatch = await bcrypt.compare(password, rows[0].password);
        if (!passMatch) {
          return res.status(422).json({ msg: "Mật khẩu không đúng" });
        } else {
          const theToken = jwt.sign({ id: rows[0].id }, process.env.SECRECT, {
            expiresIn: "1h",
          });
          return res.json({
            msg: "Success",
            token: theToken,
            idUser: rows[0].id,
          });
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};


// done hehe
module.exports.register = (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    const avatar = ""; // Thiết lập giá trị cho avatar
    const id_role = 2; // Gán quyền cho tài khoản mới mặc định là 2 : user
    const status = 1; // Thiết lập trạng thái tài khoản mới mặc định là 1 là đăng đk thành công

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
    const sqlCheckEmail = "select * from account WHERE email = ?";
    database.query(sqlCheckEmail, [email], async (err, rows, fields) => {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
      if (rows.length > 0) {
        return res
          .status(422)
          .json({ msg: "Email " + email + " đã được sử dụng" });
      }

      // Nếu email chưa tồn tại, thực hiện thêm tài khoản mới vào cơ sở dữ liệu
      const hashPass = await bcrypt.hash(password, 12); // Hash password
      const sqlRegister =
        "INSERT INTO account (username, password, name, email, avartar, id_role, status, registration_time, last_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
      database.query(
        sqlRegister,
        [username, hashPass, name, email, avatar, id_role, status],
        (err, result) => {
          if (err) {
            return res.status(500).json({ msg: err.message });
          }
          return res
            .status(201)
            .json({ msg: "Người dùng đã đăng ký thành công" });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};



module.exports.login = (req,res)=>{
  try {
      const {username,password} = req.body;
      const sql = 'SELECT * FROM user WHERE username = ? ';
      database.query(sql,[username],async(err,rows,fields)=>{
          if (err) {
              return res.json({msg:err});
          }
          //Check account exist
          if(rows.length ===0 ){
              return res.status(422).json({
                  msg: "Invalid account",
              });
          }else{
              //Confirm password
              const passMatch = await bcrypt.compare(password,rows[0].password);
              if(!passMatch){
                  return res.status(422).json({
                      msg: "Incorrect password",
                  });
              }else{
                  const theToken = jwt.sign({id:rows[0].id},process.env.SECRECT,{ expiresIn: '1h' });
                  return res.json({
                      msg:"Success",
                      token:theToken,
                      idUser: rows[0].id
                  });
              }
          }
      })
  } catch (error) {
      return res.status(500).json({ msg: err.message });
  }
}


module.exports.checkEmail = (req,res)=>{
    const {email} = req.body;
    const sql = 'select * from account WHERE email = ? ';
    database.query(sql,[email],async(err,rows,fields)=>{
        //Check email exist ?
        if(rows.length > 0 ){
            return res.status(201).json({
                msg: "Email này đã được sử dụng",
            });
        }
        else{
            return res.json({success: "Tiếp tục đăng ký"})
        }
    }
    )
}




module.exports.checkAccountName = (req,res)=>{
  const {username} = req.body;
  const sql = 'SELECT * FROM account WHERE username = ? ';
  database.query(sql,[username],async(err,rows,fields)=>{
      //Check email exist ?
      if(rows.length > 0 ){
          return res.status(201).json({
              msg: "Tên đã được sử dụng",
          });
      }
      else{
          return res.json({success: "Tiếp tục đăng ký"})
      }
  }
  )
}





module.exports.getInforAccount = (req,res)=>{
  const {id_account} = req.body;
  const sql = "select account.*, count(order.id_order) as totalBill from account left join order on account.id_account = order.id_account where account.id_account = ?  group by account.id_account;";
  database.query(sql,[id_account],(err,rows)=>{
      if(err){
          return res.json({msg:err});
      }else{
          return res.json(rows);
      }
  })
}

// dang o day
module.exports.updateProfile = (req,res)=>{
  const {id,name,email,address,phone} = req.body.data;
  const sql_update_account = "UPDATE account SET name = ? WHERE id_account = ?";
  const sql_check_role ="SELECT * FROM role WHERE id_role=?";
  database.query(sql_check_role,[id],(err,rows)=>{
      if(err){
          return res.json({msg:err});
      }
      if(rows.length===0){
          const sql_insert = "INSERT INTO role(id_role,name,description) VALUES (?,?,?)";
          db.query(sql_insert,[id_role,name,description],(err,rows)=>{
              if (err) {
                  return res.json({msg:err})
              }else{
                  return res.json({msg:"Success"})
              }
          })
      }else{
          const sql_check_role = "UPDATE role SET address = ?,phone=? WHERE id_role = ?"
          db.query(sql_update_customer,[address,phone,id],(err,rows)=>{
              if(err){
                  return res.json({msg:err})
              }else{
                  return res.json({msg:"Success"})
              }
          })
      }
      db.query(sql_update_user,[name,id])
  })

}





// const generateRandomPassword = (length) => {
//     const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     let password = "";
//     for (let i = 0; i < length; i++) {
//         const randomIndex = Math.floor(Math.random() * charset.length);
//         password += charset[randomIndex];
//     }
//     return password;
// };

// module.exports.resetPassword = async (req, res) => {
//     try {
//         const passwordLength = 8; // Độ dài mật khẩu muốn tạo
//         const password = generateRandomPassword(passwordLength); // Tạo mật khẩu ngẫu nhiên

//         const hashPass = await bcrypt.hash(password, 12); // Hash mật khẩu

//         const { id } = req.body;
//         const sql = 'SELECT * FROM account WHERE id_account = ? ';
//         database.query(sql, [id], async (err, rows, fields) => {
//             if (err) {
//                 return res.status(500).json({ msg: err.message });
//             }
//             if (rows.length === 0) {
//                 return res.status(404).json({ msg: "The Email does not exist" });
//             }
//             const user = rows[0];
//             const sql2 = 'UPDATE account SET password = ? WHERE id_account = ? ';
//             database.query(sql2, [hashPass, id], async (err, rows, fields) => {
//                 if (err) {
//                     return res.status(500).json({ msg: err.message });
//                 }
//                 Email.SendEmail(user.email, 'Forgot Password Link',
//                     `
//                     Hello ${user.name}. <br/>
//                     Your password has been reset <br/>
//                     New password : ${password} <br>
//                     Please check your email regularly !
//                     `
//                 );
//                 return res.status(200).json({ msg: "Success" });
//             });
//         });
//     } catch (error) {
//         return res.status(500).json({ msg: error.message });
//     }
// };
