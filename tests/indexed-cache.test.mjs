import {expect} from "chai";
import {MicroDbIndexedCache} from "../main.mjs";


describe('Index cache', function () {

	it('Should store a single item', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj = {
			abc: 200,
			def: 300
		};
		cache.set(obj);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.false;

		expect(cache.get(200)).to.equals(obj);
		expect(cache.get(300)).to.null;
	});


	it('Should update a previously added item', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj = {
			abc: 200,
			def: 300
		};
		cache.set(obj);

		expect(cache.has(200)).to.true;
		expect(cache.get(200)).to.equals(obj);

		const obj2 = {
			abc: 200,
			def: 400
		};
		cache.set(obj2);

		expect(cache.has(200)).to.true;
		expect(cache.get(200)).to.equals(obj2);
		expect(cache.get(200)).to.not.equals(obj);
	});


	it('Should store multiple items', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj1 = {
			abc: 200,
			def: 300
		};
		cache.set(obj1);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.false;
		expect(cache.get(200)).to.equals(obj1);
		expect(cache.get(300)).to.null;

		const obj2 = {
			abc: 300,
			def: 400
		};
		cache.set(obj2);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.true;
		expect(cache.get(200)).to.equals(obj1);
		expect(cache.get(200)).to.not.equals(obj2);
		expect(cache.get(300)).to.equals(obj2);
		expect(cache.get(300)).to.not.equals(obj1);
	});


	it('Should store multiple items at once', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj1 = {
			abc: 200,
			def: 300
		};
		const obj2 = {
			abc: 300,
			def: 400
		};

		cache.setAll([ obj1, obj2 ]);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.true;
		expect(cache.get(200)).to.equals(obj1);
		expect(cache.get(200)).to.not.equals(obj2);
		expect(cache.get(300)).to.equals(obj2);
		expect(cache.get(300)).to.not.equals(obj1);
	});

	it('Should remove an item', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj1 = {
			abc: 200,
			def: 300
		};
		const obj2 = {
			abc: 300,
			def: 400
		};

		cache.setAll([ obj1, obj2 ]);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.true;
		expect(cache.get(200)).to.equals(obj1);
		expect(cache.get(200)).to.not.equals(obj2);
		expect(cache.get(300)).to.equals(obj2);
		expect(cache.get(300)).to.not.equals(obj1);

		cache.remove(obj1);

		expect(cache.has(200)).to.false;
		expect(cache.get(200)).to.null;
		expect(cache.has(300)).to.true;
		expect(cache.get(300)).to.equals(obj2);

		cache.remove(obj2);

		expect(cache.has(200)).to.false;
		expect(cache.has(300)).to.false;
		expect(cache.get(200)).to.null;
		expect(cache.get(300)).to.null;
	});

	it('Should remove all items at once', function () {
		const cache = new MicroDbIndexedCache('abc');
		const obj1 = {
			abc: 200,
			def: 300
		};
		const obj2 = {
			abc: 300,
			def: 400
		};

		cache.setAll([ obj1, obj2 ]);

		expect(cache.has(200)).to.true;
		expect(cache.has(300)).to.true;
		expect(cache.get(200)).to.equals(obj1);
		expect(cache.get(200)).to.not.equals(obj2);
		expect(cache.get(300)).to.equals(obj2);
		expect(cache.get(300)).to.not.equals(obj1);

		cache.clear();

		expect(cache.has(200)).to.false;
		expect(cache.has(300)).to.false;
		expect(cache.get(200)).to.null;
		expect(cache.get(300)).to.null;
	});


});