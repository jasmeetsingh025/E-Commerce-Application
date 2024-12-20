class ProductModel {
  constructor(items) {
    const { name, desc, price, imageUrl, category, sizes, stock, _id } = items;
    (this._id = _id),
      (this.name = name),
      (this.desc = desc),
      (this.price = price),
      (this.imageUrl = imageUrl),
      (this.category = category),
      (this.size = sizes),
      (this.stock = stock);
  }
}

module.exports = ProductModel;
