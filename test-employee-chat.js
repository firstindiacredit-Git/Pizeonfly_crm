const axios = require('axios');

// Test the employee chat API endpoints
const BASE_URL = 'http://localhost:5000/api/employee-chat';

async function testEmployeeChat() {
  try {
    console.log('Testing Employee Chat API...\n');

    // Test 1: Get employees (excluding current user)
    console.log('1. Testing getEmployees endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/getEmployees/66ea778f237df933eb8d8e58`);
      console.log('✅ getEmployees success:', response.data.length, 'employees found');
      console.log('Sample employee:', response.data[0]?.employeeName || 'No employees');
    } catch (error) {
      console.log('❌ getEmployees error:', error.response?.data || error.message);
    }

    // Test 2: Create a chat message
    console.log('\n2. Testing createChat endpoint...');
    try {
      const messageData = {
        senderId: '66ea778f237df933eb8d8e58',
        receiverId: '66ea778f237df933eb8d8e58', // Using same ID for testing
        message: 'Hello, this is a test message!'
      };
      
      const response = await axios.post(`${BASE_URL}/createChat`, messageData);
      console.log('✅ createChat success:', response.data.message);
    } catch (error) {
      console.log('❌ createChat error:', error.response?.data || error.message);
    }

    // Test 3: Get chats for an employee
    console.log('\n3. Testing getChats endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/getChats/66ea778f237df933eb8d8e58`);
      console.log('✅ getChats success:', response.data.length, 'messages found');
    } catch (error) {
      console.log('❌ getChats error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Employee Chat API testing completed!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testEmployeeChat();
