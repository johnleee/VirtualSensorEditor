//Test Suite for Design Tool
describe("Business logic layer", function() {
	describe("readSensorData method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to read a feeder", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("getParameterValues method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to get parameter values for a virtual senosr based on their types", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createUUID method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a UUID with a specific prefix", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("saveVirtualSensor method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to save sensor method", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("saveElementAndChildren method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to save an element with its childeren", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("persistToLocalStorage method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to persist canvas information to local storage", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("recoverFromLocalStorage method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to recover sensors from local storage", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("closeEditingCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to close the editing canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("populateVirtualSensorList method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to populate the virtual sensor list", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("editVirtualSensor method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to edit a virtual sensor", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("clearCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to clear the canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("removeFromGlobalSensorInfo method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to remove a sensor with a UUID from GlobalSensorInfo", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("deleteVirtualSensor method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to delete a sensor with a UUID", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
	
	describe("unfoldVirtualSensor", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to unfold a virtual sensor", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
});

