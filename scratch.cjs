const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wdtdmlrddupdohmvoalb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdGRtbHJkZHVwZG9obXZvYWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTU0OTgsImV4cCI6MjEwMzk5MTQ5OH0.nSoh2US8leDQnAPRDJ-QIh_kqINwwQMZfygIPodlRyg');

supabase.from('deadstock_in').select('*').limit(1).then(res => {
  if(res.data && res.data.length > 0) {
    console.log(Object.keys(res.data[0]));
  } else {
    console.log('No data');
  }
});
