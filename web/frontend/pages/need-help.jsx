import { Card, Page, Layout, TextContainer, Heading,Button } from "@shopify/polaris";
import { TitleBar,useNavigate } from "@shopify/app-bridge-react";

export default function PageName() {
  const navigate = useNavigate();

  return (
    <Page fullWidth>
      <TitleBar
        title="Help Section"
      />
      <Layout>
        <Layout.Section oneHalf>
          <Card sectioned>
            <Heading>Using This App</Heading>
            <TextContainer>
              <p>With this app you can define your locals or standard clothing measurements easily. You can add size chart in your apparel store, most of the customers drop out because they are confused of their sizes, with this app , your sales will boost. Some users do returns because of wrong sizes, this app will reduce returning orders.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>How To Add App Widget In Your Store Front?</Heading>
            <TextContainer>
              <p>In the app dashboard, you can click on "Connect other Theme" button. In the popup window you can select the theme, on which you want to enable the widget , select the theme from dropdown and then click on "Connect Your Theme" button. For further info you can watch this video.</p>
            </TextContainer>
            <iframe width="100%" style={{marginTop:'1rem'}} height="400" src="https://www.youtube.com/embed/zzopZBOBHCo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
        <Card sectioned>
            <Heading>Where can I see the App-Widget on my storefront?</Heading>
            <TextContainer>
              <p>App-Widget will be visible on the product page on which you have targeted size charts.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>I can't see the app widget on my store.</Heading>
            <TextContainer>
              <p>Make sure you have enabled the app widget from theme customization. You can add "App Block" or "App Embed" to your storefront.</p>
            </TextContainer>
          </Card>
          <Card sectioned>
            <Heading>I have enabled App-Widget but still can't see the app widget on my product page.</Heading>
            <TextContainer>
              <p>Make sure you have created a size chart and targeted products in it. If you have not created the size chart, </p>
              <Button onClick={()=> navigate('/measurements/create')}>Create Sizing Chart</Button>

            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
