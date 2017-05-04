console.log('call schema');
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInterfaceType } from 'graphql'
import { SPFObj } from '../model'
import { SPFObjType } from './spfobj'
import { PlantType } from './plant'
console.log('schema-obj',SPFObjType);
console.log('schema-plant',PlantType);
export default new GraphQLSchema({
	//types is required to list all possible class implementing interface, maybe for better validating
	types:[PlantType,SPFObjType],
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
					console.log(id);
					return SPFObj.gen(context,id )
						.then((data) => {
							console.log(data);
							return data;
						});
				},
			}
		}
	})
});