/**
 * @template K
 * @template T
 * @public
 */
export default class MicroDbIndexedCache {

	/**
	 * @type {string}
	 */
	fieldName;
	/**
	 *
	 * @type {Map<K,T>}
	 */
	#map = new Map();

	/**
	 * @type {?((item: *) => T)}
	 */
	#valueTransform;

	/**
	 *
	 * @param {string} fieldName
	 * @param {?((item: *) => T)} [valueTransform]
	 */
	constructor(fieldName, valueTransform) {
		this.fieldName = fieldName;
		this.#valueTransform = valueTransform;
	}


	/**
	 *
	 */
	clear(){
		this.#map.clear();
	}


	/**
	 *
	 * @param {K} key
	 * @return {?T}
	 */
	get(key){
		return this.#map.get(key) || null;
	}

	/**
	 *
	 * @param {K} key
	 * @return {boolean}
	 */
	has(key){
		return this.#map.has(key);
	}

	/**
	 *
	 * @param {T[]} values
	 */
	setAll(values){
		for (let value of values) {
			this.set(value);
		}
	}

	/**
	 *
	 * @param {T} value
	 */
	set(value){
		const key = this.#getKeyFromObj(value);

		if(key !== null && key !== undefined)
			this.#map.set(key, this.#valueTransform ? this.#valueTransform.call(null, value, key) : value);
	}

	/**
	 *
	 * @param {T} value
	 */
	remove(value){
		const key = this.#getKeyFromObj(value);

		if(key !== null && key !== undefined)
			this.#map.delete(key);
	}

	/**
	 *
	 * @param {K} keyValue
	 */
	removeWithKey(keyValue){
		if(keyValue !== null && keyValue !== undefined)
			this.#map.delete(keyValue);
	}


	/**
	 * @type {?string[]}
	 */
	#fieldNameDescriptorArray;
	#getKeyFromObj(obj){
		const arr = this.#fieldNameDescriptorArray ? this.#fieldNameDescriptorArray : this.fieldName.split(".");
		while(arr.length && (obj = obj[arr.shift()]));
		return obj;
	}

}
