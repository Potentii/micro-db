import DataAccess from "../utils/data-access.mjs";
import MicroDbIndexedCache from "./micro-db-indexed-cache.mjs";
import {UniqueUtils} from "@potentii/unique-utils";


/**
 * @template K [The entities' ID type]
 * @template T [The entities type]
 * @public
 */
export default class MicroDbRepo {
	/**
	 *
	 * @type {string}
	 */
	#storeDirectory;
	/**
	 *
	 * @type {string}
	 */
	#dataKey;
	/**
	 *
	 * @type {string}
	 */
	#idFieldName;
	/**
	 *
	 * @type {T[]}
	 */
	#allCache = [];

	/**
	 *
	 * @type {MicroDbIndexedCache<K,T>}
	 */
	#byIdIndexedCache;

	/**
	 *
	 * @type {Map<string, MicroDbIndexedCache<*, T>>}
	 */
	#indexedCaches = new Map();
	/**
	 *
	 * @type {boolean}
	 */
	#suppressWarnings;



	/**
	 *
	 * @param {string} storeDirectory The absolute path to the save directory
	 * @param {string} dataKey The name of the data file to store the entities (without the extension)
	 * @param {string} [idFieldName='id'] The name of the ID field (defaults to 'id')
	 * @param {MicroDbIndexedCache[]} [indexedCaches=[]] All the indexed caches
	 * @param {boolean} [suppressWarnings=false] Whether it suppress the warnings on the console
	 */
	constructor(storeDirectory, dataKey, idFieldName = 'id', indexedCaches = [], suppressWarnings = false) {
		this.#storeDirectory = storeDirectory;
		this.#dataKey = dataKey;
		this.#idFieldName = idFieldName;
		this.#suppressWarnings = suppressWarnings
		this.#byIdIndexedCache = new MicroDbIndexedCache(idFieldName);
		for (let indexedCache of indexedCaches) {
			this.#indexedCaches.set(indexedCache.fieldName, indexedCache);
		}
	}




	async refreshCache(){
		const allEntities = (await DataAccess.readData(this.#storeDirectory, this.#dataKey)) || [];

		// *Updating the caches:
		this.#allCache = [];
		for(let entity of allEntities){
			this.#allCache.push(entity);
		}

		this.#byIdIndexedCache.clear();
		this.#byIdIndexedCache.setAll(allEntities);

		for (let indexedCache of this.#indexedCaches.values()) {
			indexedCache.clear();
			indexedCache.setAll(allEntities);
		}
	}




	/**
	 *
	 * @param {string} id
	 * @return {?T}
	 */
	getById(id){
		return this.#byIdIndexedCache.get(id);
	}

	/**
	 *
	 * @param {string} fieldName
	 * @param {*} fieldValue
	 * @return {?T}
	 */
	getByfield(fieldName, fieldValue){
		if(fieldName == this.#idFieldName)
			return this.getById(fieldValue);

		if(this.#indexedCaches.has(fieldName)) // TODO check if index is 'unique'
			return this.#indexedCaches.get(fieldName).get(fieldValue);

		if(!this.#suppressWarnings)
			console.warn(`MicroDbRepo.getByfield: Searching for non indexed field "${fieldName}"`);

		return this.#allCache.find(entity => entity[fieldName] == fieldValue);
	}

	/**
	 *
	 * @param {string} fieldName
	 * @param {*} fieldValue
	 * @return {T[]}
	 */
	getListByfield(fieldName, fieldValue){
		if(fieldName == this.#idFieldName)
			return [ this.getById(fieldValue) ];

		if(this.#indexedCaches.has(fieldName)) // TODO check if index is 'group'
			return this.#indexedCaches.get(fieldName).get(fieldValue);

		if(!this.#suppressWarnings)
			console.warn(`MicroDbRepo.getListByfield: Searching for non indexed field "${fieldName}"`);

		return this.#allCache.filter(entity => entity[fieldName] == fieldValue);
	}

	/**
	 *
	 * @return {T[]}
	 */
	getAll(){
		return [...this.#allCache];
	}




	/**
	 *
	 * @param {string} id
	 * @return {boolean}
	 */
	hasWithId(id){
		return this.#byIdIndexedCache.has(id);
	}

	/**
	 *
	 * @param {string} fieldName
	 * @param {*} fieldValue
	 * @return {boolean}
	 */
	hasWithfield(fieldName, fieldValue){
		if(fieldName == this.#idFieldName)
			return this.hasWithId(fieldValue);
		return this.#indexedCaches.get(fieldName).has(fieldValue);
	}




	/**
	 * Upsert
	 * - With ID set: update
	 * - Without ID set: insert
	 * @param {T} entity
	 * @return {Promise<T>}
	 */
	async save(entity){
		const entityClone = JSON.parse(JSON.stringify(entity));
		if(!entityClone[this.#idFieldName])
			entityClone[this.#idFieldName] = UniqueUtils.uuid.generateAgainstPredicate(id => this.#byIdIndexedCache.has(id));



		// *Updating the caches:
		if(this.hasWithId(entityClone[this.#idFieldName])){
			const index = this.#allCache.findIndex(e => e[this.#idFieldName] == entityClone[this.#idFieldName]);
			this.#allCache[index] = entityClone;
		} else{
			this.#allCache.push(entityClone);
		}
		this.#byIdIndexedCache.set(entityClone);
		for (let indexedCache of this.#indexedCaches.values()) {
			indexedCache.set(entityClone);
		}

		// *Saving the data file:
		await DataAccess.saveData(this.#storeDirectory, this.#dataKey, this.#allCache);

		return entityClone;
	}

	/**
	 *
	 * @param {T[]} entities
	 * @return {Promise<T[]>}
	 */
	async saveAll(entities){
		const entitiesClones = [];
		for (let entity of entities) {
			const entityClone = JSON.parse(JSON.stringify(entity));
			if(!entityClone[this.#idFieldName])
				entityClone[this.#idFieldName] = UniqueUtils.uuid.generateAgainstPredicate(id => this.#byIdIndexedCache.has(id));

			// *Updating the caches:
			if(this.hasWithId(entityClone[this.#idFieldName])){
				const index = this.#allCache.findIndex(e => e[this.#idFieldName] == entityClone[this.#idFieldName]);
				this.#allCache[index] = entityClone;
			} else{
				this.#allCache.push(entityClone);
			}
			this.#byIdIndexedCache.set(entityClone);
			for (let indexedCache of this.#indexedCaches.values()) {
				indexedCache.set(entityClone);
			}

			entitiesClones.push(entityClone);
		}

		// *Saving the data file:
		await DataAccess.saveData(this.#storeDirectory, this.#dataKey, this.#allCache);

		return entitiesClones;
	}


	/**
	 *
	 * @param {T} entity
	 * @return {Promise<void>}
	 */
	async remove(entity){
		return this.removeWithId(entity[this.#idFieldName]);
	}


	/**
	 *
	 * @param {string} id
	 * @return {Promise<void>}
	 */
	async removeWithId(id){
		if(!this.hasWithId(id))
			return;

		const index = this.#allCache.findIndex(e => e[this.#idFieldName] == id);
		if(index >= 0){
			const entity = this.getById(id);
			this.#allCache.splice(index, 1);
			this.#byIdIndexedCache.removeWithKey(id);
			for (let indexedCache of this.#indexedCaches.values()) {
				indexedCache.removeWithKey(entity);
			}
			await DataAccess.saveData(this.#storeDirectory, this.#dataKey, this.#allCache);
		}
	}

}