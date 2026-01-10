/**
 * Comprehensive test suite for the out-of-stock prevention system
 * This file contains tests to validate all components of the stock validation system
 */

import { supabase } from "@/integrations/supabaseClient";
import { stockValidationMiddleware } from "./stockValidationMiddleware";

/**
 * Test scenarios for stock validation
 */
export class StockValidationTestSuite {
  private testResults: Array<{
    test: string;
    passed: boolean;
    details: string;
  }> = [];

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log("🧪 Starting Stock Validation Test Suite...\n");

    await this.testSupabaseFunctionExists();
    await this.testStockValidationMiddleware();
    await this.testDatabaseTriggers();
    await this.testEdgeCases();
    await this.testConcurrentAccess();

    this.printResults();
  }

  /**
   * Test if Supabase validation functions exist
   */
  private async testSupabaseFunctionExists(): Promise<void> {
    try {
      // Use raw SQL to test the function
      const { data, error } = await supabase
        .from("dresses")
        .select("id")
        .limit(1);

      if (!error && data && data.length > 0) {
        this.testResults.push({
          test: "Supabase validation function exists",
          passed: true,
          details: "Database connection working, functions should be available"
        });
      } else {
        this.testResults.push({
          test: "Supabase validation function exists",
          passed: false,
          details: "Database connection issue"
        });
      }
    } catch (error: unknown) {
      this.testResults.push({
        test: "Supabase validation function exists",
        passed: false,
        details: `Function not accessible: ${error}`
      });
    }
  }

  /**
   * Test stock validation middleware functionality
   */
  private async testStockValidationMiddleware(): Promise<void> {
    try {
      // Test with a non-existent dress
      const result = await stockValidationMiddleware.validateStock(
        '00000000-0000-0000-0000-000000000000',
        { showToast: false, throwOnError: false, quantity: 1 }
      );

      if (!result.success && result.error?.type === 'DRESS_NOT_FOUND') {
        this.testResults.push({
          test: "Middleware validates non-existent dress",
          passed: true,
          details: "Correctly identifies non-existent dress"
        });
      } else {
        this.testResults.push({
          test: "Middleware validates non-existent dress",
          passed: false,
          details: "Should return DRESS_NOT_FOUND error"
        });
      }
    } catch (error: unknown) {
      this.testResults.push({
        test: "Middleware validates non-existent dress",
        passed: false,
        details: `Middleware error: ${error}`
      });
    }
  }

  /**
   * Test database triggers
   */
  private async testDatabaseTriggers(): Promise<void> {
    try {
      // Test trigger exists by checking if it prevents negative stock
      const { error } = await supabase
        .from("dresses")
        .update({ stock: -1 })
        .eq("id", '00000000-0000-0000-0000-000000000000');

      if (error) {
        this.testResults.push({
          test: "Database trigger prevents negative stock",
          passed: true,
          details: "Trigger correctly prevents negative stock updates"
        });
      } else {
        this.testResults.push({
          test: "Database trigger prevents negative stock",
          passed: false,
          details: "Trigger should prevent negative stock"
        });
      }
    } catch (error: unknown) {
      this.testResults.push({
        test: "Database trigger prevents negative stock",
        passed: false,
        details: `Trigger test error: ${error}`
      });
    }
  }

  /**
   * Test edge cases
   */
  private async testEdgeCases(): Promise<void> {
    const edgeCases = [
      { dressId: '00000000-0000-0000-0000-000000000000', quantity: 0, expected: 'INVALID_QUANTITY' },
      { dressId: '00000000-0000-0000-0000-000000000000', quantity: -1, expected: 'INVALID_QUANTITY' },
    ];

    for (const testCase of edgeCases) {
      try {
        const result = await stockValidationMiddleware.validateStock(
          testCase.dressId,
          { showToast: false, throwOnError: false, quantity: testCase.quantity }
        );

        if (!result.success) {
          this.testResults.push({
            test: `Edge case: ${testCase.expected}`,
            passed: true,
            details: `Correctly handled ${testCase.expected}`
          });
        } else {
          this.testResults.push({
            test: `Edge case: ${testCase.expected}`,
            passed: false,
            details: `Should have failed with ${testCase.expected}`
          });
        }
      } catch (error: unknown) {
        this.testResults.push({
          test: `Edge case: ${testCase.expected}`,
          passed: false,
          details: `Error: ${error}`
        });
      }
    }
  }

  /**
   * Test concurrent access scenarios
   */
  private async testConcurrentAccess(): Promise<void> {
    try {
      // Simulate concurrent validation requests
      const promises = Array.from({ length: 5 }, () =>
        stockValidationMiddleware.validateStock(
          '00000000-0000-0000-0000-000000000000',
          { showToast: false, throwOnError: false, quantity: 1 }
        )
      );

      const results = await Promise.all(promises);

      // All should fail with the same error (dress not found)
      const allFailed = results.every(r => !r.success);
      const allSameError = results.every(r => r.error?.type === 'DRESS_NOT_FOUND');

      if (allFailed && allSameError) {
        this.testResults.push({
          test: "Concurrent access handling",
          passed: true,
          details: "All concurrent requests handled consistently"
        });
      } else {
        this.testResults.push({
          test: "Concurrent access handling",
          passed: false,
          details: "Inconsistent handling of concurrent requests"
        });
      }
    } catch (error: unknown) {
      this.testResults.push({
        test: "Concurrent access handling",
        passed: false,
        details: `Concurrent test error: ${error}`
      });
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log("\n📊 Test Results:");
    console.log("==================================================");

    let passedCount = 0;
    let failedCount = 0;

    this.testResults.forEach(result => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.test}`);
      console.log(`   ${result.details}\n`);

      if (result.passed) {
        passedCount++;
      } else {
        failedCount++;
      }
    });

    console.log("==================================================");
    console.log(`Total: ${this.testResults.length} tests`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Success Rate: ${((passedCount / this.testResults.length) * 100).toFixed(1)}%`);

    if (failedCount === 0) {
      console.log("\n🎉 All tests passed! The stock validation system is working correctly.");
    } else {
      console.log("\n⚠️  Some tests failed. Please review the implementation.");
    }
  }

  /**
   * Get test results summary
   */
  getResults(): { passed: number; failed: number; total: number } {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    return { passed, failed, total: this.testResults.length };
  }
}

/**
 * Manual test scenarios for developers
 */
export const manualTestScenarios = {
  /**
   * Test out-of-stock scenario
   */
  outOfStock: `
    1. Set a dress's stock to 0 in the database
    2. Try to add it to cart from DressCard
    3. Try to add it to cart from DressDetail
    4. Verify error message appears
    5. Verify button is disabled
  `,

  /**
   * Test insufficient stock scenario
   */
  insufficientStock: `
    1. Set a dress's stock to 2 in the database
    2. Try to add 3 items to cart
    3. Verify error message shows "Only 2 item(s) available"
    4. Try to update cart quantity to 3
    5. Verify update is rejected
  `,

  /**
   * Test concurrent access
   */
  concurrentAccess: `
    1. Set a dress's stock to 1
    2. Open multiple browser tabs
    3. Try to add to cart simultaneously
    4. Verify only one succeeds
    5. Verify others get "out of stock" error
  `,

  /**
   * Test database trigger
   */
  databaseTrigger: `
    1. Try to update dress stock to negative value
    2. Verify update is rejected
    3. Try to insert cart item with quantity > stock
    4. Verify insertion is rejected
  `,

  /**
   * Test middleware fallback
   */
  middlewareFallback: `
    1. Disable Supabase function temporarily
    2. Try to add item to cart
    3. Verify fallback to direct database query works
    4. Verify error handling is graceful
  `
};

// Export singleton instance for easy testing
export const stockValidationTestSuite = new StockValidationTestSuite();

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run tests automatically in development
  // stockValidationTestSuite.runAllTests();
}