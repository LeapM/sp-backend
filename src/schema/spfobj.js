import sql from 'mssql'
import chalk from 'chalk'
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql'
import { SPFObj } from '../model'

const SPFObjType = new GraphQLObjectType({
	name: 'SPFObjType',
	fields: {
		objuid: { type: GraphQLString }
	}
})

export default new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			spfobj: {
				type: SPFObjType,
        args:{
          id:{
            type: GraphQLString,
            defaultValue:'002OOOA'
          }
        },
				resolve(parent,{id},context) {
					return SPFObj.gen(context,id )
						.then((data) => {
							return data;
						});
				}
			}
		}
	})
});