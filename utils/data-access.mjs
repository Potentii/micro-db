import fs from "fs/promises";
import path from "path";

/**
 * @package
 */
export default class DataAccess{

	/**
	 *
	 * @template T
	 * @param {string} directory
	 * @param {string} key
	 * @return {Promise<?T>}
	 */
	static async readData(directory, key){
		try{
			const dataStr = await fs.readFile(path.join(directory, key + '.json'), 'utf8');
			if(!dataStr)
				return null;
			return JSON.parse(dataStr);
		} catch(err){
			if(err.code == 'ENOENT')
				return null;
			throw err;
		}
	}

	/**
	 *
	 * @template T
	 * @param {string} directory
	 * @param {string} key
	 * @param {?T} newData
	 * @return {Promise<void>}
	 */
	static async saveData(directory, key, newData){
		await fs.writeFile(path.join(directory, key + '.json'), newData ? JSON.stringify(newData) : '', 'utf8');
	}

}