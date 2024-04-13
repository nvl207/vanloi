var database = require("../config/db_connect");
const Email = require('./email_controller')
const getPriceVND = require ('../util/csvWriter')
module.exports.getProductByCart = (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.json([]); // Trả về một mảng rỗng nếu không có dữ liệu
    }
    const productIds = data.map((item) => item.id); // Lấy ra các id sản phẩm từ dữ liệu
    const placeholders = productIds.map(() => "?").join(","); // Tạo placeholder cho mỗi id sản phẩm
    const sql_query = `SELECT * FROM product WHERE id_product IN (${placeholders})`;
    database.query(sql_query, productIds, (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      const products = rows.map((row) => ({
        ...row,
        status: false, // Thêm trường status với giá trị mặc định false
      }));
      // Thêm thông tin số lượng và kích thước vào mỗi sản phẩm
      const result = products.map((product, index) => ({
        ...product,
        quantity: data[index].quantity,
        size: data[index].size,
      }));
      return res.json(result); // Trả về mảng các sản phẩm
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Invalid JSON data" });
  }
}; // done
//getProductByCartApp


//getProductFavorite
module.exports.getProductFavorite = (req, res) => {
  const { data } = req.body;

  try {
    const objData = JSON.parse(data);
    
    if (!Array.isArray(objData)) {
      throw new Error("Dữ liệu không phải là một mảng JSON.");
    }

    if (objData.length === 0) {
      return res.json([]);
    }

    const sql = `
      SELECT 
        product.*,
        AVG(review.evaluate) AS avgRating,
        COUNT(review.id_review) AS numReviews 
      FROM 
        product 
      LEFT JOIN 
        review ON product.id_product = review.id_product 
      WHERE 
        product.id_product = ? 
      GROUP BY 
        product.id_product`;
      
    let promises = objData.map((item) => {
      return new Promise((resolve, reject) => {
        database.query(sql, [item.id], (err, rows) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            if (rows.length > 0) {
              const productData = {
                ...rows[0],
                quantity: item.name // Giả sử item.name chứa thông tin số lượng
              };
              resolve(productData);
            } else {
              resolve(null);
            }
          }
        });
      });
    });

    Promise.all(promises)
      .then((results) => {
        const filteredResults = results.filter((result) => result !== null);
        res.json(filteredResults);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu." });
      });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Dữ liệu không hợp lệ." });
  }
};




//addBill
//getBillByIdUser
//getBillById
//getProductByIdBill
