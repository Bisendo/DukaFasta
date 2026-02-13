module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false // must be NOT NULL
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("owner", "shopkeeper"),
      allowNull: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  User.associate = (models) => {
    User.hasMany(models.User, { foreignKey: "ownerId", as: "shopkeepers" });
    User.belongsTo(models.User, { foreignKey: "ownerId", as: "owner" });
    User.hasMany(models.Product, { foreignKey: "ownerId" });
    User.hasMany(models.Sale, { foreignKey: "shopkeeperId" });
  };

  return User;
};
