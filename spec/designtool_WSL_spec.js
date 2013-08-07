//Test Suite for Design Tool
describe("Design tool", function() {
	describe("setupAjaxTimer_quarentine method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});

		it("should be able to read a feeder", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("calcGlobalControlDeviceValue_quarentine method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});

		it("should be able to read a feeder", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});
});

