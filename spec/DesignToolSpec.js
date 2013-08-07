//Test Suite for Design Tool
describe("Design tool", function() {
	//Context
	describe("readSensorData method", function() {
		var feederUUID = "hcjacmf";
		
		//Initialization
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		//Spec (Test case)
		it("should be able to read a feeder", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
});

