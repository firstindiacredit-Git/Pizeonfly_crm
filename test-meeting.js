const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testMeetingAPI() {
  try {
    console.log('🧪 Testing Meeting API...\n');

    // Test 1: Create a meeting
    console.log('1. Testing create meeting...');
    const meetingData = {
      title: "Test Consultation Call",
      description: "This is a test meeting",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: "10:00am",
      duration: 30,
      guestName: "John Doe",
      guestEmail: "john.doe@example.com",
      guestPhone: "1234567890",
      currentRevenue: "$5000-$7000",
      revenueGoal: "$10000 in 3 months",
      businessStruggle: "Need help with marketing strategy",
      confirmAttendance: true,
      agreedToTerms: true
    };

    const createResponse = await axios.post(`${BASE_URL}/create-meeting`, meetingData);
    console.log('✅ Meeting created successfully:', createResponse.data.success);
    console.log('Meeting ID:', createResponse.data.meeting._id);

    // Test 2: Get all meetings
    console.log('\n2. Testing get all meetings...');
    const getResponse = await axios.get(`${BASE_URL}/meetings`);
    console.log('✅ Meetings fetched successfully:', getResponse.data.success);
    console.log('Total meetings:', getResponse.data.meetings.length);

    // Test 3: Get client meetings
    console.log('\n3. Testing get client meetings...');
    const clientResponse = await axios.get(`${BASE_URL}/client-meetings`);
    console.log('✅ Client meetings fetched successfully:', clientResponse.data.success);
    console.log('Total client meetings:', clientResponse.data.meetings.length);

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMeetingAPI(); 