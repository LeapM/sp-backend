import sql from 'mssql'
import chalk from 'chalk'
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'
import { Plant } from '../model'

const PlantType = new GraphQLObjectType({
	name: 'Plant',
	fields: {
		objuid: { type: GraphQLString }
	}
})

export default new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			plant: {
				type: PlantType,
				resolve() {
					return Plant.gen(null, '002OOOA')
						.then((data) => {
							return data;
						});
				}
			}
		}
	})
});