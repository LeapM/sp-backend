import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInterfaceType,
	GraphQLList,
	GraphQLNonNull
} from 'graphql'
import { SPFObj } from '../model'
import { SPFObjType } from './spfobj'
import { SimpleObjectType } from './simpleObjectType'
import { DocObjectType } from './docObjectType'
const QueryType = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		spfobj: {
			type: SPFObjType,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLString),
					//defaultValue:'002OOOA'
				}
			},
			resolve(parent, { id }, context) {
				return SPFObj.gen(context, id)
					.then((data) => {
						return data;
					});
			},
		},
		spfobjByName: {
			type: new GraphQLList(SPFObjType),
			args: {
				name: {
					type: GraphQLString,
				},
				classdef: {
					type: GraphQLString
				},
				domain: {
					type: GraphQLString
				}
			},
			resolve(parent, {name, ...rest}, context) {
				return SPFObj.genByName(context,name, rest)
					.then((data) => data);
			}
		}
	}
})

export default new GraphQLSchema({
	//types is required to list all possible class implementing interface, maybe for better validating
	types: [DocObjectType, SimpleObjectType, SPFObjType],
	query: QueryType
});