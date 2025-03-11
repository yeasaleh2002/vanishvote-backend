module.exports = (sequelize, DataTypes) => {
  const Poll = sequelize.define(
    "Poll",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      expiresIn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      votes: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
    }
  );
  return Poll;
};
