package database

import (
	"backend/models"
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func gameMapCollection() *mongo.Collection {
	return Client.Database("minigolf").Collection("gameMap")
}

func GetGameMap(map_id string) (models.GameMapDto, error) {
	collection := gameMapCollection()

	var result models.GameMapDto
	err := collection.FindOne(context.Background(), bson.M{"id": map_id}).Decode(&result)
	return result, err
}

func GetGameMaps() ([]models.GameMapDto, error) {
	collection := gameMapCollection()

	cur, err := collection.Find(context.Background(), bson.M{"tiles": bson.M{"$exists": true}})
	if err != nil {
		return nil, err
	}

	// Must initialize with an empty slice. Otherwise jsonMarshal returns null -> now an empty array.
	var result []models.GameMapDto = make([]models.GameMapDto, 0)
	cur.All(context.Background(), &result)

	return result, nil
}

func CreateGameMap(dto models.GameMapDto) (interface{}, error) {
	collection := gameMapCollection()

	res, err := collection.UpdateOne(context.Background(), bson.M{"id": dto.Id}, bson.M{"$setOnInsert": dto}, options.Update().SetUpsert(true))

	if err != nil {
		return nil, err
	}

	return res.UpsertedID, nil
}

func UpdateGameMapStats(map_id string, score int64) error {
	collection := gameMapCollection()

	_, err := collection.UpdateOne(
		context.Background(),
		bson.M{"id": map_id},
		bson.D{
			{Key: "$inc", Value: bson.M{"stats.sum": score}},
			{Key: "$inc", Value: bson.M{"stats.count": 1}},
		},
	)
	return err
}
