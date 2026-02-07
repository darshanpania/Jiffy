/**
 * Jest Global Teardown
 * Runs once after all test suites complete
 */

module.exports = async () => {
  console.log('\n✅ All tests complete!');
  console.log('📊 Check coverage report in ./coverage/index.html\n');
};
