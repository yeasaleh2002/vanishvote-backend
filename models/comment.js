module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
      "Comment",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        pollId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Polls",
            key: "id",
          },
        },
        text: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        timestamps: true,
      }
    );
    return Comment;
  };
  