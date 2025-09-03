// Energy Quest: Energy Calculator Implementation
// Real energy calculation system dengan formula E = (P × t) / 1000

class EnergyCalculator {
    constructor() {
        // Indonesian electricity tariff (PLN 2024)
        this.tariffPerKwh = GAME_CONSTANTS.PLN_TARIFF_PER_KWH; // Rp 1,467.28/kWh
        this.targetMonthlyBill = GAME_CONSTANTS.TARGET_MONTHLY_BILL; // Rp 300,000
    }

    /**
     * Calculate energy consumption using the formula: E = (P × t) / 1000
     * @param {number} powerWatts - Device power consumption in Watts
     * @param {number} timeHours - Usage time in hours
     * @returns {number} Energy consumption in kWh
     */
    calculateEnergyConsumption(powerWatts, timeHours) {
        if (powerWatts < 0 || timeHours < 0) {
            throw new Error('Power and time must be non-negative');
        }
        
        return (powerWatts * timeHours) / 1000;
    }

    /**
     * Calculate monthly electricity bill based on energy consumption
     * @param {number} monthlyKwh - Monthly energy consumption in kWh
     * @returns {number} Monthly bill in Rupiah
     */
    calculateMonthlyBill(monthlyKwh) {
        if (monthlyKwh < 0) {
            throw new Error('Energy consumption must be non-negative');
        }
        
        return monthlyKwh * this.tariffPerKwh;
    }

    /**
     * Calculate daily energy consumption for an appliance
     * @param {number} powerWatts - Appliance power in Watts
     * @param {number} hoursPerDay - Hours used per day
     * @returns {number} Daily energy consumption in kWh
     */
    calculateDailyConsumption(powerWatts, hoursPerDay) {
        return this.calculateEnergyConsumption(powerWatts, hoursPerDay);
    }

    /**
     * Calculate total energy consumption from multiple appliances
     * @param {Array} appliances - Array of appliance objects with power and hours
     * @returns {Object} Consumption breakdown
     */
    calculateTotalConsumption(appliances) {
        let totalDailyKwh = 0;
        const breakdown = [];

        appliances.forEach(appliance => {
            const dailyKwh = this.calculateDailyConsumption(appliance.power, appliance.hours || 0);
            const monthlyKwh = dailyKwh * 30;
            const monthlyCost = this.calculateMonthlyBill(monthlyKwh);

            const applianceData = {
                name: appliance.name,
                power: appliance.power,
                hoursPerDay: appliance.hours || 0,
                dailyKwh: dailyKwh,
                monthlyKwh: monthlyKwh,
                monthlyCost: monthlyCost,
                isOn: appliance.isOn || false
            };

            if (appliance.isOn) {
                totalDailyKwh += dailyKwh;
            }

            breakdown.push(applianceData);
        });

        const totalMonthlyKwh = totalDailyKwh * 30;
        const totalMonthlyBill = this.calculateMonthlyBill(totalMonthlyKwh);

        return {
            totalDailyKwh: totalDailyKwh,
            totalMonthlyKwh: totalMonthlyKwh,
            totalMonthlyBill: totalMonthlyBill,
            breakdown: breakdown,
            efficiency: this.calculateEfficiencyRating(totalMonthlyBill),
            isWithinTarget: totalMonthlyBill <= this.targetMonthlyBill
        };
    }

    /**
     * Calculate efficiency percentage based on target vs actual usage
     * @param {number} actualBill - Actual monthly bill
     * @param {number} targetBill - Target monthly bill (optional)
     * @returns {number} Efficiency percentage (0-100)
     */
    calculateEfficiencyPercentage(actualBill, targetBill = null) {
        const target = targetBill || this.targetMonthlyBill;
        
        if (actualBill <= 0) return 100;
        if (target <= 0) return 0;
        
        // If actual is less than or equal to target, efficiency is 100%
        if (actualBill <= target) return 100;
        
        // Calculate efficiency based on how much over target we are
        const efficiency = (target / actualBill) * 100;
        return Math.max(0, Math.min(100, efficiency));
    }

    /**
     * Get efficiency rating based on monthly bill
     * @param {number} monthlyBill - Monthly bill in Rupiah
     * @returns {Object} Efficiency rating object
     */
    calculateEfficiencyRating(monthlyBill) {
        return GAME_UTILS.getEfficiencyRating(monthlyBill);
    }

    /**
     * Calculate potential savings if efficiency is improved
     * @param {number} currentBill - Current monthly bill
     * @param {number} targetEfficiencyPercentage - Target efficiency (0-100)
     * @returns {number} Potential monthly savings in Rupiah
     */
    calculatePotentialSavings(currentBill, targetEfficiencyPercentage) {
        if (targetEfficiencyPercentage < 0 || targetEfficiencyPercentage > 100) {
            throw new Error('Target efficiency percentage must be between 0 and 100');
        }
        
        const targetBill = currentBill * (targetEfficiencyPercentage / 100);
        return Math.max(0, currentBill - targetBill);
    }

    /**
     * Get optimization suggestions based on appliance usage
     * @param {Array} appliances - Array of appliance objects
     * @returns {Array} Array of optimization suggestions
     */
    getOptimizationSuggestions(appliances) {
        const suggestions = [];
        const consumption = this.calculateTotalConsumption(appliances);

        // High power device suggestions
        appliances.forEach(appliance => {
            if (appliance.isOn && appliance.power > 500) {
                suggestions.push({
                    type: 'high_power',
                    appliance: appliance.name,
                    message: `${appliance.name} (${appliance.power}W) mengonsumsi daya tinggi. Pertimbangkan untuk mengurangi waktu pemakaian.`,
                    potentialSaving: this.calculateMonthlyBill(this.calculateDailyConsumption(appliance.power, 1) * 30)
                });
            }

            if (appliance.isOn && appliance.hours > 8 && appliance.power > 100) {
                suggestions.push({
                    type: 'long_usage',
                    appliance: appliance.name,
                    message: `${appliance.name} digunakan ${appliance.hours} jam/hari. Coba kurangi waktu pemakaian.`,
                    potentialSaving: this.calculateMonthlyBill(this.calculateDailyConsumption(appliance.power, 2) * 30)
                });
            }
        });

        // General suggestions based on total bill
        if (consumption.totalMonthlyBill > this.targetMonthlyBill) {
            const excess = consumption.totalMonthlyBill - this.targetMonthlyBill;
            suggestions.push({
                type: 'over_target',
                message: `Tagihan melebihi target sebesar ${GAME_UTILS.formatCurrency(excess)}. Matikan perangkat yang tidak digunakan.`,
                potentialSaving: excess
            });
        }

        // Efficiency suggestions
        if (consumption.efficiency.label !== 'SANGAT HEMAT') {
            suggestions.push({
                type: 'efficiency',
                message: 'Gunakan perangkat hemat energi dan manfaatkan cahaya alami di siang hari.',
                potentialSaving: consumption.totalMonthlyBill * 0.2 // Estimate 20% savings
            });
        }

        return suggestions;
    }

    /**
     * Simulate different scenarios for energy usage
     * @param {Array} appliances - Base appliances
     * @param {Object} scenarios - Different usage scenarios
     * @returns {Object} Scenario comparison results
     */
    simulateScenarios(appliances, scenarios) {
        const results = {};

        Object.keys(scenarios).forEach(scenarioName => {
            const scenario = scenarios[scenarioName];
            const modifiedAppliances = appliances.map(appliance => ({
                ...appliance,
                isOn: scenario.appliances[appliance.name]?.isOn !== undefined ? 
                      scenario.appliances[appliance.name].isOn : appliance.isOn,
                hours: scenario.appliances[appliance.name]?.hours !== undefined ? 
                       scenario.appliances[appliance.name].hours : appliance.hours
            }));

            results[scenarioName] = {
                ...this.calculateTotalConsumption(modifiedAppliances),
                description: scenario.description
            };
        });

        return results;
    }

    /**
     * Calculate carbon footprint based on energy consumption
     * @param {number} monthlyKwh - Monthly energy consumption in kWh
     * @returns {Object} Carbon footprint data
     */
    calculateCarbonFootprint(monthlyKwh) {
        // Indonesia's electricity carbon intensity: ~0.85 kg CO2/kWh (approximate)
        const carbonIntensity = 0.85;
        const monthlyCarbon = monthlyKwh * carbonIntensity;
        const yearlyCarbon = monthlyCarbon * 12;

        return {
            monthlyKgCO2: monthlyCarbon,
            yearlyKgCO2: yearlyCarbon,
            yearlyTonsCO2: yearlyCarbon / 1000,
            equivalentTrees: Math.ceil(yearlyCarbon / 21.77) // Trees needed to offset per year
        };
    }

    /**
     * Generate energy report with detailed analysis
     * @param {Array} appliances - Array of appliances
     * @returns {Object} Comprehensive energy report
     */
    generateEnergyReport(appliances) {
        const consumption = this.calculateTotalConsumption(appliances);
        const suggestions = this.getOptimizationSuggestions(appliances);
        const carbonFootprint = this.calculateCarbonFootprint(consumption.totalMonthlyKwh);
        const efficiency = this.calculateEfficiencyPercentage(consumption.totalMonthlyBill);

        // Find highest consuming appliances
        const sortedAppliances = consumption.breakdown
            .filter(app => app.isOn)
            .sort((a, b) => b.monthlyCost - a.monthlyCost);

        const report = {
            summary: {
                totalMonthlyBill: consumption.totalMonthlyBill,
                totalMonthlyKwh: consumption.totalMonthlyKwh,
                efficiencyPercentage: efficiency,
                efficiencyRating: consumption.efficiency,
                isWithinTarget: consumption.isWithinTarget,
                excessAmount: Math.max(0, consumption.totalMonthlyBill - this.targetMonthlyBill)
            },
            breakdown: consumption.breakdown,
            topConsumers: sortedAppliances.slice(0, 3),
            suggestions: suggestions,
            carbonFootprint: carbonFootprint,
            potentialSavings: suggestions.reduce((total, suggestion) => 
                total + (suggestion.potentialSaving || 0), 0
            ),
            generatedAt: new Date().toISOString()
        };

        return report;
    }

    /**
     * Validate appliance data
     * @param {Array} appliances - Array of appliances to validate
     * @returns {Object} Validation results
     */
    validateAppliances(appliances) {
        const errors = [];
        const warnings = [];

        appliances.forEach((appliance, index) => {
            if (!appliance.name) {
                errors.push(`Appliance ${index}: Name is required`);
            }

            if (typeof appliance.power !== 'number' || appliance.power < 0) {
                errors.push(`Appliance ${index}: Power must be a non-negative number`);
            }

            if (typeof appliance.hours !== 'number' || appliance.hours < 0 || appliance.hours > 24) {
                errors.push(`Appliance ${index}: Hours must be between 0 and 24`);
            }

            if (appliance.power > 3000) {
                warnings.push(`Appliance ${index}: ${appliance.name} has unusually high power consumption (${appliance.power}W)`);
            }

            if (appliance.hours > 16 && appliance.power > 100) {
                warnings.push(`Appliance ${index}: ${appliance.name} is used for many hours with significant power consumption`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }
}

// Kitchen-specific energy calculator
class KitchenEnergyCalculator extends EnergyCalculator {
    constructor() {
        super();
        this.kitchenAppliances = this.initializeKitchenAppliances();
    }

    initializeKitchenAppliances() {
        const appliances = GAME_CONSTANTS.APPLIANCES;
        return [
            { ...appliances.REFRIGERATOR, isOn: true, hours: 24 }, // Always on
            { ...appliances.RICE_COOKER, isOn: false, hours: 2 },
            { ...appliances.MICROWAVE, isOn: false, hours: 0.5 },
            { ...appliances.BLENDER, isOn: false, hours: 0.3 },
            { ...appliances.FAN, isOn: false, hours: 10 },
            { ...appliances.LED_LAMP, isOn: true, hours: 8 }
        ];
    }

    calculateKitchenEfficiency(appliances, environmentalFactors = {}) {
        const baseConsumption = this.calculateTotalConsumption(appliances);
        
        // Environmental factors
        let adjustedConsumption = baseConsumption.totalDailyKwh;
        
        // Natural light usage reduces lamp consumption
        if (environmentalFactors.naturalLight && environmentalFactors.lampOff) {
            const lampConsumption = appliances.find(a => a.name.includes('Lampu'))?.power || 0;
            adjustedConsumption -= this.calculateDailyConsumption(lampConsumption, 4); // 4 hours saved
        }

        // Fridge door open penalty
        if (environmentalFactors.fridgeDoorOpenTime > 5) { // More than 5 seconds
            const penalty = (environmentalFactors.fridgeDoorOpenTime / 60) * 0.1; // 0.1 kWh per minute
            adjustedConsumption += penalty;
        }

        const adjustedMonthlyKwh = adjustedConsumption * 30;
        const adjustedMonthlyBill = this.calculateMonthlyBill(adjustedMonthlyKwh);
        const efficiency = this.calculateEfficiencyPercentage(adjustedMonthlyBill);

        return {
            baseConsumption: baseConsumption,
            adjustedDailyKwh: adjustedConsumption,
            adjustedMonthlyKwh: adjustedMonthlyKwh,
            adjustedMonthlyBill: adjustedMonthlyBill,
            efficiency: efficiency,
            efficiencyRating: this.calculateEfficiencyRating(adjustedMonthlyBill),
            environmentalImpact: environmentalFactors
        };
    }
}

// Laboratory simulator energy calculator
class LaboratoryEnergyCalculator extends EnergyCalculator {
    constructor() {
        super();
        this.houseAppliances = this.initializeHouseAppliances();
    }

    initializeHouseAppliances() {
        const appliances = GAME_CONSTANTS.APPLIANCES;
        return Object.values(appliances).map(appliance => ({
            ...appliance,
            isOn: appliance.essential,
            hours: appliance.essential ? appliance.defaultHours : 0
        }));
    }

    simulateHouseholdBill(appliances) {
        const result = this.calculateTotalConsumption(appliances);
        const report = this.generateEnergyReport(appliances);
        
        return {
            ...result,
            report: report,
            passesTarget: result.totalMonthlyBill <= this.targetMonthlyBill,
            grade: this.calculateGrade(result.totalMonthlyBill)
        };
    }

    calculateGrade(monthlyBill) {
        const efficiency = this.calculateEfficiencyPercentage(monthlyBill);
        
        if (efficiency >= 95) return 'A+';
        if (efficiency >= 90) return 'A';
        if (efficiency >= 80) return 'B+';
        if (efficiency >= 70) return 'B';
        if (efficiency >= 60) return 'C+';
        if (efficiency >= 50) return 'C';
        if (efficiency >= 40) return 'D';
        return 'E';
    }
}

// Global instances
window.EnergyCalculator = EnergyCalculator;
window.KitchenEnergyCalculator = KitchenEnergyCalculator;
window.LaboratoryEnergyCalculator = LaboratoryEnergyCalculator;

// Create global calculator instance
window.energyCalculator = new EnergyCalculator();
window.kitchenCalculator = new KitchenEnergyCalculator();
window.labCalculator = new LaboratoryEnergyCalculator();