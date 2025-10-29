namespace Services.Paystack.DTOs
{
    public class BankInfoResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public List<BankData> Data { get; set; }
        //public Meta Meta { get; set; }
    }

    public class BankData
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Country { get; set; }
        public string Currency { get; set; }
        public string Type { get; set; }
        public int Id { get; set; }
    }

    //public class Meta
    //{
    //    public string Next { get; set; }
    //    public string Previous { get; set; }
    //    public int PerPage { get; set; }
    //}

}
