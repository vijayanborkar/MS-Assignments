module.exports = (sequelize, DataTypes) => {
  const photo = sequelize.define(
    "photo",
    {
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altDescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateSaved: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
    }
  );

  return photo;
};
