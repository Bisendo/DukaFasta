module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product", // model name
    {
      name: { type: DataTypes.STRING, allowNull: false },
      buyPrice: { type: DataTypes.FLOAT, allowNull: false },
      sellPrice: { type: DataTypes.FLOAT, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      ownerId: { type: DataTypes.INTEGER, allowNull: false }
    },
    {
      tableName: "Products" // explicitly set table name
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: "ownerId" });
    Product.hasMany(models.Sale, { foreignKey: "productId" });
  };

  return Product;
};
