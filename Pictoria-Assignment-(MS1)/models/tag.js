module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photoId: {
        type: DataTypes.INTEGER,
        references: {
          model: "photos",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
    }
  );

  return tag;
};
