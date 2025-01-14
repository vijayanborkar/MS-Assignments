module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("user", {
        username: {
            type: DataTypes.STRING, allowNull: false,
        }, email: {
            type: DataTypes.STRING, allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return user;
};
