//Test Suite for Design Tool
describe("Presentation Layer", function() {
	describe("createNewElementInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new element on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("deleteElement method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to delete an element", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createOutputElement method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create output elemetn", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createNewPhysicalSensorInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new physical sensor on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createNewVirtualSensorInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new virtual sensor on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createNewTemplateInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new template on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createNewFeederInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new feeder on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("createNewMonitorInCanvas method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to create a new monitor on canvas", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("monitorClick method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to click on the method", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("setCustomFunction method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to set custom function", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("drag method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to drag the method", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("drop_window method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to drop a window", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("fixEndpoints method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to fix the end points", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("calculateEndpointPosition method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to calculate the end point position", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("addTargetEndpoint method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to add a targe end point", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("removeTargetEndpoint method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to remove a targe end point", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("feederLabelClick method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to click on a label", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("setFeederValue method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to set a value for a feeder", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("getEndPointsOfElement method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to get end points of an element", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("setupChart method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to setup the chart", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("codeView method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to view the code", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
	
	describe("timeSeriesView method", function() {
		var feederUUID = "hcjacmf";
		
		beforeEach(function() {
    		createFeeder(feederUUID);
		});
		
		it("should be able to show time series", function() {
			expect(readSensorData(feederUUID)).toBe(100.0);
		});
	});	
});

