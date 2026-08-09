module.exports = (sequelize, DataTypes) => {
  const Sale = sequelize.define("Sale", {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitBuyPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    unitSellPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    profit: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shopkeeperId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Sale.associate = (models) => {
    // Sale belongs to Product
    Sale.belongsTo(models.Product, {
      foreignKey: "productId"
    });

    // Sale belongs to Shopkeeper (User)
    Sale.belongsTo(models.User, {
      foreignKey: "shopkeeperId"
    });
  };

  return Sale;
};
